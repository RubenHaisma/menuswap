import asyncio
import os
from typing import Tuple
import aiohttp
from tqdm import tqdm

from .db import (
    get_conn,
    get_pooled_conn,
    select_menus_without_dishes,
    upsert_dish,
)
from .dish_extractor import extract_dishes_from_url
from .config import USER_AGENT
from .utils import slugify
from .log import get_logger


def fetch_target_menus(limit=2000):
    with get_conn() as conn, conn.cursor() as cur:
        return select_menus_without_dishes(cur, limit)


async def process_menu(row, session: aiohttp.ClientSession) -> int:
    log = get_logger("extract")
    menu_id, restaurant_id, url = row
    dishes = await extract_dishes_from_url(url, session=session)
    if not dishes:
        return 0
    created = 0
    with get_pooled_conn() as conn, conn.cursor() as cur:
        for d in dishes:
            name = d["name"]
            price_cents = d.get("price_cents")
            section = d.get("section") or "Overig"
            description = d.get("description")
            slug = slugify(name)
            _dish_id, is_new = upsert_dish(
                cur,
                menu_id=menu_id,
                name=name,
                slug=slug,
                section=section,
                price_cents=price_cents,
                description=description,
                tags=[],
                image_url=None,
            )
            if is_new:
                created += 1
    return created


async def main(concurrency=8, limit=2000):
    log = get_logger("extract")
    rows = fetch_target_menus(limit=limit)
    log.info(f"Extracting dishes for {len(rows)} menu pages with concurrency={concurrency}")
    sem = asyncio.Semaphore(concurrency)
    created_total = 0

    async with aiohttp.ClientSession(headers={"User-Agent": USER_AGENT}) as session:
        async def worker(row):
            async with sem:
                return await process_menu(row, session=session)

        tasks = [asyncio.create_task(worker(r)) for r in rows]
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks)):
            try:
                created_total += await f
            except Exception as e:
                log.debug(f"worker failed: {e}")
    log.info(f"Created {created_total} dishes from HTML menus.")


if __name__ == "__main__":
    concurrency = int(os.getenv("CONCURRENCY", "8"))
    limit = int(os.getenv("EXTRACT_LIMIT", "2000"))
    asyncio.run(main(concurrency=concurrency, limit=limit))


