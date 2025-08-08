import asyncio
from typing import List, Dict, Optional
import aiohttp
from bs4 import BeautifulSoup

from .config import USER_AGENT, REQUEST_TIMEOUT_SECONDS
from .utils import PRICE_RE, price_string_to_cents, slugify
from .log import get_logger


async def fetch_html(session: aiohttp.ClientSession, url: str) -> Optional[str]:
    log = get_logger("extract")
    try:
        async with session.get(url, timeout=REQUEST_TIMEOUT_SECONDS) as r:
            if r.status >= 400:
                return None
            ctype = r.headers.get("content-type", "")
            if "text/html" not in ctype:
                return None
            return await r.text(errors="ignore")
    except Exception:
        log.debug(f"Failed fetching HTML for extraction: {url}")
        return None


def heuristically_extract_dishes_from_html(html: str) -> List[Dict]:
    """Parse likely dishes from an HTML page using simple heuristics.

    Returns a list of dicts: { name, price_cents, section?, description? }
    """
    soup = BeautifulSoup(html, "lxml")

    # Try common menu structures: definition lists, tables, and lists
    results: List[Dict] = []

    def add_result(name: str, price_text: Optional[str], section: Optional[str], desc: Optional[str] = None):
        name = (name or "").strip()
        if not name:
            return
        price_cents = price_string_to_cents(price_text) if price_text else -1
        results.append({
            "name": name,
            "price_cents": price_cents if price_cents >= 0 else None,
            "section": (section or "Overig").strip() or "Overig",
            "description": (desc or None),
        })

    # 1) <dl><dt>name</dt><dd>desc ... €price</dd></dl>
    for dl in soup.find_all("dl"):
        # Optional preceding heading as section
        section = None
        prev = dl.find_previous(lambda t: t.name in ("h1","h2","h3","h4","h5","h6"))
        if prev:
            section = prev.get_text(strip=True)
        dts = dl.find_all("dt")
        dds = dl.find_all("dd")
        for dt, dd in zip(dts, dds):
            name = dt.get_text(" ", strip=True)
            text = dd.get_text(" ", strip=True)
            m = PRICE_RE.search(text)
            price_text = m.group(1) if m else None
            add_result(name, price_text, section, text)

    # 2) Tables: one col name, another price
    for table in soup.find_all("table"):
        # Optional heading as section
        section = None
        prev = table.find_previous(lambda t: t.name in ("h1","h2","h3","h4","h5","h6"))
        if prev:
            section = prev.get_text(strip=True)
        for tr in table.find_all("tr"):
            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td","th"])]
            if len(cells) < 1:
                continue
            # Find price-looking cell
            price_cell = None
            for c in cells[::-1]:
                if PRICE_RE.search(c):
                    price_cell = c
                    break
            name_cell = None
            if price_cell:
                for c in cells:
                    if c != price_cell and len(c) >= 2:
                        name_cell = c
                        break
            if name_cell:
                m = PRICE_RE.search(price_cell)
                price_text = m.group(1) if m else None
                add_result(name_cell, price_text, section)

    # 3) List items: "Dish – €12,50"
    for li in soup.find_all("li"):
        text = li.get_text(" ", strip=True)
        if not text:
            continue
        m = PRICE_RE.search(text)
        if m:
            price_text = m.group(1)
            # Split by common separators to isolate name
            name = text.split(" – ")[0].split(" - ")[0].split(" : ")[0]
            section = None
            prev = li.find_previous(lambda t: t.name in ("h1","h2","h3","h4","h5","h6"))
            if prev:
                section = prev.get_text(strip=True)
            add_result(name, price_text, section, text)

    # Deduplicate by name+price
    seen = set()
    unique: List[Dict] = []
    for d in results:
        key = (d["name"].lower(), d.get("price_cents"))
        if key in seen:
            continue
        seen.add(key)
        unique.append(d)
    return unique


async def extract_dishes_from_url(url: str, session: Optional[aiohttp.ClientSession] = None) -> List[Dict]:
    owns = False
    if session is None:
        session = aiohttp.ClientSession(headers={"User-Agent": USER_AGENT})
        owns = True
    try:
        html = await fetch_html(session, url)
        if not html:
            return []
        return heuristically_extract_dishes_from_html(html)
    finally:
        if owns:
            await session.close()


