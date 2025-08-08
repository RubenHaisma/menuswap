import asyncio
import os
import aiohttp
from typing import List, Optional, Tuple
from .db import get_conn, get_pooled_conn, select_menus_needing_download, record_menu_downloads_bulk
from .fetcher import download_menu_source
from .config import USER_AGENT
from .log import get_logger

def fetch_pending_sources(limit=2000):
    with get_conn() as conn, conn.cursor() as cur:
        return select_menus_needing_download(cur, limit)

async def main(concurrency=10, limit=2000):
    log = get_logger("downloader")
    rows = fetch_pending_sources(limit=limit)
    log.info(f"Downloading {len(rows)} sources with concurrency={concurrency}")
    sem = asyncio.Semaphore(concurrency)
    results: List[Tuple[str, str, str]] = []  # (menu_id, checksum, path)

    async with aiohttp.ClientSession(headers={"User-Agent": USER_AGENT}) as session:
        async def worker(row):
            async with sem:
                menu_id, url = row
                log.debug(f"GET {url} (menu {menu_id})")
                try:
                    res: Optional[Tuple[str, str, str]] = await download_menu_source(menu_id, url, session=session)
                    return res
                except Exception as e:
                    # Guard against a single connection error crashing the entire run
                    log.debug(f"Download failed for menu {menu_id} {url}: {e}")
                    return None

        tasks = [asyncio.create_task(worker(r)) for r in rows]
        for fut in asyncio.as_completed(tasks):
            try:
                r = await fut
            except Exception as e:
                log.debug(f"Task failed: {e}")
                r = None
            if r is not None:
                results.append(r)

    if results:
        updates = [(checksum, menu_id) for (menu_id, checksum, _path) in results]
        with get_pooled_conn() as conn, conn.cursor() as cur:
            record_menu_downloads_bulk(cur, updates)
    log.info(f"Downloads complete. Updated {len(results)} checksums.")

if __name__ == "__main__":
    concurrency = int(os.getenv("CONCURRENCY", "10"))
    limit = int(os.getenv("DOWNLOAD_LIMIT", "2000"))
    asyncio.run(main(concurrency=concurrency, limit=limit))
