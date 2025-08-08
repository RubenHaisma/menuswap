import aiohttp, asyncio, json
from .log import get_logger
from .config import OVERPASS_URL, USER_AGENT
from .db import get_conn, upsert_restaurant, upsert_restaurants_bulk
from .models import SeedRestaurant

# Overpass: NL restaurants/cafes with website if present
QUERY = """
[out:json][timeout:90];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
(
  node["amenity"~"restaurant|cafe|fast_food"](area.nl);
  way["amenity"~"restaurant|cafe|fast_food"](area.nl);
  relation["amenity"~"restaurant|cafe|fast_food"](area.nl);
);
out center tags;
"""

async def fetch_overpass():
    async with aiohttp.ClientSession(headers={"User-Agent": USER_AGENT}) as s:
        async with s.post(OVERPASS_URL, data={"data": QUERY}) as r:
            r.raise_for_status()
            return await r.json()

def extract_entities(payload):
    for el in payload.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name: continue
        lat = el.get("lat") or el.get("center",{}).get("lat")
        lon = el.get("lon") or el.get("center",{}).get("lon")
        addr = ", ".join(filter(None, [
            tags.get("addr:street"),
            tags.get("addr:housenumber"),
            tags.get("addr:city")
        ])) or None
        city = tags.get("addr:city")
        website = tags.get("website") or tags.get("contact:website")
        rid = f"{el['type']}/{el['id']}"
        yield SeedRestaurant(
            osm_id=rid, name=name, city=city, address=addr,
            website_url=website, lat=lat, lon=lon
        ).model_dump()

async def main():
    log = get_logger("seed")
    log.info("Fetching OSM Overpass data…")
    data = await fetch_overpass()
    items = list(extract_entities(data))
    log.info(f"Found {len(items)} venues")
    with get_conn() as conn, conn.cursor() as cur:
        log.info("Upserting restaurants in bulk…")
        upsert_restaurants_bulk(cur, items, batch_size=1000)
    log.info("Seed complete.")

if __name__ == "__main__":
    asyncio.run(main())
