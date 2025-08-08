import aiohttp
from typing import Optional
from bs4 import BeautifulSoup
from .config import USER_AGENT, REQUEST_TIMEOUT_SECONDS, MENU_HINT_WORDS
from .utils import normalize_url, looks_like_menu_link, classify_source_type, PRICE_RE
from .log import get_logger

async def fetch_html(session, url):
    log = get_logger("finder")
    try:
        async with session.get(url, timeout=REQUEST_TIMEOUT_SECONDS) as r:
            if r.status >= 400: 
                return None
            ctype = r.headers.get("content-type","")
            if "text/html" not in ctype:
                return None
            return await r.text(errors="ignore")
    except Exception:
        log.debug(f"Failed fetching HTML: {url}")
        return None

async def find_menu_links(base_url: str, session: Optional[aiohttp.ClientSession] = None):
    owns_session = False
    if session is None:
        session = aiohttp.ClientSession(headers={"User-Agent": USER_AGENT})
        owns_session = True
    try:
        log = get_logger("finder")
        html = await fetch_html(session, base_url)
        if not html:
            return []
        soup = BeautifulSoup(html, "lxml")
        candidates = set()
        # <a> links by text and href
        for a in soup.find_all("a"):
            text = (a.get_text() or "").strip()
            href = a.get("href")
            norm = normalize_url(base_url, href) if href else None
            hay = " ".join([text, href or ""]) 
            if norm and looks_like_menu_link(hay, MENU_HINT_WORDS):
                candidates.add(norm)
        # Sometimes menus are embedded as images on the same page; if there are clear price patterns,
        # also consider the base page itself a candidate "URL" menu.
        body_text = soup.get_text(" ")[:50000]
        if PRICE_RE.search(body_text):
            candidates.add(base_url)
        return [{"url": u, "source_type": classify_source_type(u)} for u in candidates]
    finally:
        if owns_session:
            await session.close()
