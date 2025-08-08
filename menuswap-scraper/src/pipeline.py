import asyncio
from src.seed_osm import main as seed_main
from src.crawl_queue import main as crawl_main
from src.extractor import main as extract_main
from src.log import get_logger

async def pipeline():
    log = get_logger("pipeline")
    log.info("Seeding from OSM…")
    await seed_main()
    log.info("Discovering menu links…")
    await crawl_main(limit=750000, concurrency=6)
    log.info("Extracting dishes from HTML menus…")
    await extract_main(concurrency=8, limit=1000000)
    log.info("Done.")

if __name__ == "__main__":
    asyncio.run(pipeline())
