import asyncio
import aiohttp
from tqdm import tqdm
from .db import (
    get_conn,
    get_pooled_conn,
    ensure_menu_for_source,
    select_restaurants_needing_crawl,
)
from .menu_link_finder import find_menu_links
from .config import USER_AGENT, UPDATE_MODE
from .log import get_logger

def fetch_target_restaurants(limit=5000):
    with get_conn() as conn, conn.cursor() as cur:
        return select_restaurants_needing_crawl(cur, limit, update_mode=UPDATE_MODE)

async def process_restaurant(row, session: aiohttp.ClientSession):
    log = get_logger("crawl")
    rest_id, name, site = row
    log.debug(f"Fetching menu links for {name} ({rest_id}) {site}")
    links = await find_menu_links(site, session=session)
    if not links: return 0
    created = 0
    with get_pooled_conn() as conn, conn.cursor() as cur:
        for l in links:
            _menu_id, is_new = ensure_menu_for_source(cur, rest_id, l["url"], l["source_type"])
            if is_new:
                created += 1
    return created

async def main(limit=5000, concurrency=6):
    log = get_logger("crawl")
    rows = fetch_target_restaurants(limit=limit)
    log.info(f"Crawling {len(rows)} restaurants with concurrency={concurrency}")
    sem = asyncio.Semaphore(concurrency)
    created_total = 0

    async with aiohttp.ClientSession(headers={"User-Agent": USER_AGENT}) as session:
        async def worker(row):
            async with sem:
                return await process_restaurant(row, session=session)

        tasks = [asyncio.create_task(worker(r)) for r in rows]
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks)):
            created_total += await f
    log.info(f"Discovered {created_total} new menu sources.")

if __name__ == "__main__":
    asyncio.run(main())
