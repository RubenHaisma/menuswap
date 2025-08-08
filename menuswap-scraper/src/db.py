import psycopg
import time
import contextlib
import queue
from .config import DATABASE_URL
from .utils import slugify
from .log import get_logger

def get_conn():
    """Open a new connection with retry/backoff."""
    log = get_logger("db")
    delay = 0.5
    attempts = 5
    last_err = None
    for i in range(attempts):
        try:
            return psycopg.connect(DATABASE_URL, autocommit=True)
        except Exception as e:
            last_err = e
            log.debug(f"connect attempt {i+1}/{attempts} failed; retrying in {delay:.1f}s…")
            time.sleep(delay)
            delay = min(delay * 2, 5.0)
    raise last_err


class _ConnectionPool:
    def __init__(self, maxsize: int = 6):
        self._log = get_logger("db")
        self._pool: "queue.LifoQueue[psycopg.Connection]" = queue.LifoQueue(maxsize)
        self._created = 0
        self._maxsize = maxsize

    def _create_conn(self) -> psycopg.Connection:
        return get_conn()

    def acquire(self) -> psycopg.Connection:
        try:
            # Fast path: reuse if available
            return self._pool.get_nowait()
        except queue.Empty:
            if self._created < self._maxsize:
                conn = self._create_conn()
                self._created += 1
                return conn
            # Pool exhausted: block until one is returned
            return self._pool.get()

    def release(self, conn: psycopg.Connection) -> None:
        try:
            self._pool.put_nowait(conn)
        except queue.Full:
            # Shouldn't happen; close extra connection
            try:
                conn.close()
            except Exception:
                pass


_GLOBAL_POOL = _ConnectionPool(maxsize=6)


@contextlib.contextmanager
def get_pooled_conn():
    """Context manager yielding a pooled connection with retry/backoff.

    Limits the number of open DB connections and reduces pressure during high concurrency.
    """
    conn = _GLOBAL_POOL.acquire()
    try:
        yield conn
    finally:
        _GLOBAL_POOL.release(conn)

def upsert_restaurant(cur, r):
    """Upsert into Prisma's "Restaurant" by unique slug.

    Prisma model fields: id (uuid), name, slug (unique), city, address, websiteUrl, lat, lon.
    We derive slug from name + city.
    """
    name = r["name"]
    raw_city = r.get("city")
    # DB requires non-null city; provide a stable fallback for missing cities
    city_for_db = raw_city or "Unknown"
    # Ensure slug uniqueness even when city is missing by using a short OSM id suffix
    if raw_city:
        slug_base = f"{name}-{raw_city}"
    else:
        osm_id = r.get("osm_id", "")
        osm_suffix = osm_id.replace("/", "-")[-6:] if osm_id else "unk"
        slug_base = f"{name}-unknown-{osm_suffix}"
    slug = slugify(slug_base)
    cur.execute(
        """
        insert into "Restaurant" ("name", "slug", "city", "address", "websiteUrl", "lat", "lon", "updatedAt")
        values (%s,%s,%s,%s,%s,%s,%s, now())
        on conflict ("slug") do update set
          "name"=excluded."name",
          "city"=excluded."city",
          "address"=excluded."address",
          "websiteUrl"=coalesce(excluded."websiteUrl", "Restaurant"."websiteUrl"),
          "lat"=excluded."lat",
          "lon"=excluded."lon",
          "updatedAt"=now()
        returning id
        """,
        (name, slug, city_for_db, r.get("address"), r.get("website_url"), r.get("lat"), r.get("lon")),
    )
    return cur.fetchone()[0]

def ensure_menu_for_source(cur, restaurant_id: str, url: str, source_type: str):
    """Create a "Menu" row for a discovered source if not already present.

    Deduplicate by (restaurantId, sourceUrl).
    source_type must be one of Prisma enum values: PDF, IMAGE, URL.
    """
    cur.execute(
        "select id from \"Menu\" where \"restaurantId\"=%s and \"sourceUrl\"=%s",
        (restaurant_id, url),
    )
    existing = cur.fetchone()
    if existing:
        return existing[0], False
    cur.execute(
        "insert into \"Menu\" (\"restaurantId\", \"sourceType\", \"sourceUrl\") values (%s, %s::\"SourceType\", %s) returning id",
        (restaurant_id, source_type, url),
    )
    return cur.fetchone()[0], True

def upsert_restaurants_bulk(cur, records, batch_size: int = 1000):
    """Bulk upsert restaurants by slug using batched executemany (psycopg3).

    records: iterable of dicts with keys matching SeedRestaurant.model_dump()
    """
    log = get_logger("db")

    def to_row(r):
        name = r["name"]
        raw_city = r.get("city")
        city_for_db = raw_city or "Unknown"
        if raw_city:
            slug_base = f"{name}-{raw_city}"
        else:
            osm_id = r.get("osm_id", "")
            osm_suffix = osm_id.replace("/", "-")[-6:] if osm_id else "unk"
            slug_base = f"{name}-unknown-{osm_suffix}"
        slug = slugify(slug_base)
        return (
            name,
            slug,
            city_for_db,
            r.get("address"),
            r.get("website_url"),
            r.get("lat"),
            r.get("lon"),
        )

    buf = []
    count = 0
    for rec in records:
        buf.append(to_row(rec))
        if len(buf) >= batch_size:
            cur.executemany(
                """
                insert into "Restaurant" ("name", "slug", "city", "address", "websiteUrl", "lat", "lon", "updatedAt")
                values (%s,%s,%s,%s,%s,%s,%s, now())
                on conflict ("slug") do update set
                  "name"=excluded."name",
                  "city"=excluded."city",
                  "address"=excluded."address",
                  "websiteUrl"=coalesce(excluded."websiteUrl", "Restaurant"."websiteUrl"),
                  "lat"=excluded."lat",
                  "lon"=excluded."lon",
                  "updatedAt"=now()
                """,
                buf,
            )
            count += batch_size
            log.info(f"Upserted {count} restaurants so far…")
            buf.clear()
    if buf:
        cur.executemany(
            """
            insert into "Restaurant" ("name", "slug", "city", "address", "websiteUrl", "lat", "lon", "updatedAt")
            values (%s,%s,%s,%s,%s,%s,%s, now())
            on conflict ("slug") do update set
              "name"=excluded."name",
              "city"=excluded."city",
              "address"=excluded."address",
              "websiteUrl"=coalesce(excluded."websiteUrl", "Restaurant"."websiteUrl"),
              "lat"=excluded."lat",
              "lon"=excluded."lon",
              "updatedAt"=now()
            """,
            buf,
        )
        count += len(buf)
        log.info(f"Upserted {count} restaurants in total.")

def select_restaurants_with_websites(cur, limit: int):
    cur.execute(
        "select id, name, \"websiteUrl\" from \"Restaurant\" where \"websiteUrl\" is not null and \"websiteUrl\" <> '' order by id asc limit %s",
        (limit,),
    )
    return cur.fetchall()

def select_restaurants_needing_crawl(cur, limit: int, update_mode: bool):
    """Return restaurants to crawl.

    - When update_mode is False: only restaurants with a website and no existing Menu rows
    - When update_mode is True: all restaurants with a website
    """
    if update_mode:
        cur.execute(
            "select id, name, \"websiteUrl\" from \"Restaurant\" where \"websiteUrl\" is not null and \"websiteUrl\" <> '' order by id asc limit %s",
            (limit,),
        )
    else:
        # Exclude restaurants that already have at least one Menu record
        cur.execute(
            """
            select r.id, r.name, r."websiteUrl"
            from "Restaurant" r
            where r."websiteUrl" is not null
              and r."websiteUrl" <> ''
              and not exists (
                select 1 from "Menu" m where m."restaurantId" = r.id
              )
            order by r.id asc
            limit %s
            """,
            (limit,),
        )
    return cur.fetchall()

def select_menus_needing_download(cur, limit: int):
    """Pick menus that have a sourceUrl and no checksum yet (not downloaded)."""
    cur.execute(
        "select id, \"sourceUrl\" from \"Menu\" where \"sourceUrl\" is not null and (\"checksum\" is null or \"checksum\" = '') order by \"uploadedAt\" asc limit %s",
        (limit,),
    )
    return cur.fetchall()

def record_menu_download(cur, menu_id: str, checksum: str):
    cur.execute(
        "update \"Menu\" set \"checksum\"=%s where id=%s",
        (checksum, menu_id),
    )

def record_menu_downloads_bulk(cur, updates):
    """Batch update checksums: updates is List[Tuple[checksum, menu_id]]"""
    if not updates:
        return
    # Psycopg3 executemany
    cur.executemany(
        "update \"Menu\" set \"checksum\"=%s where id=%s",
        updates,
    )

def select_menus_without_dishes(cur, limit: int):
    """Return menus that have a sourceUrl and zero dishes.

    Prioritize HTML sources (URL) so we can parse dishes from the page.
    """
    cur.execute(
        """
        select m.id, m."restaurantId", m."sourceUrl"
        from "Menu" m
        where m."sourceUrl" is not null
          and m."sourceType" = 'URL'
          and not exists (
            select 1 from "Dish" d where d."menuId" = m.id
          )
        order by m."uploadedAt" asc
        limit %s
        """,
        (limit,),
    )
    return cur.fetchall()

def upsert_dish(cur, menu_id: str, name: str, slug: str, section: str, price_cents, description=None, tags=None, image_url=None):
    """Upsert a Dish on (menuId, slug) to avoid duplicates.

    Returns (dish_id, is_new)
    """
    if tags is None:
        tags = []
    # Check existing by (menuId, slug)
    cur.execute(
        "select id from \"Dish\" where \"menuId\"=%s and slug=%s",
        (menu_id, slug),
    )
    row = cur.fetchone()
    if row:
        # Update basic fields if changed
        cur.execute(
            """
            update "Dish"
            set name=%s, description=%s, "priceCents"=%s, section=%s, tags=%s, "imageUrl"=%s
            where id=%s
            """,
            (name, description, price_cents, section, tags, image_url, row[0]),
        )
        return row[0], False
    else:
        cur.execute(
            """
            insert into "Dish" ("menuId", name, slug, description, "priceCents", section, tags, "imageUrl")
            values (%s,%s,%s,%s,%s,%s,%s,%s)
            returning id
            """,
            (menu_id, name, slug, description, price_cents, section, tags, image_url),
        )
        return cur.fetchone()[0], True
