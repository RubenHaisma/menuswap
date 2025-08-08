import re
from urllib.parse import urljoin

PRICE_RE = re.compile(r"(€\s?\d{1,3}([.,]\d{2})?)")
PDF_RE = re.compile(r"\.pdf($|\?)", re.I)
IMAGE_RE = re.compile(r"\.(png|jpe?g|webp)($|\?)", re.I)
SLUG_BAD_CHARS_RE = re.compile(r"[^a-z0-9-]+")

def normalize_url(base, href):
    try:
        u = urljoin(base, href)
        # strip anchors
        return u.split("#")[0]
    except Exception:
        return None

def looks_like_menu_link(text_or_href: str, hint_words) -> bool:
    s = (text_or_href or "").lower()
    if any(w in s for w in hint_words): 
        return True
    if PDF_RE.search(s) or IMAGE_RE.search(s):
        return True
    return False

def classify_source_type(url: str) -> str:
    # Map to Prisma enum values: PDF, IMAGE, URL
    if PDF_RE.search(url): return "PDF"
    if IMAGE_RE.search(url): return "IMAGE"
    # Default to URL for HTML/unknown
    return "URL"

def slugify(value: str) -> str:
    """Create a URL-friendly slug similar to app's slugify.

    Lowercase, replace whitespace and underscores with dashes, remove bad chars,
    collapse multiple dashes, and strip leading/trailing dashes.
    """
    if not value:
        return ""
    s = value.lower()
    s = re.sub(r"[\s_]+", "-", s)
    s = SLUG_BAD_CHARS_RE.sub("", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s

def price_string_to_cents(price_str: str) -> int:
    """Convert a euro price string (e.g. "€ 9,50" or "9.50") to integer cents.

    - Accepts comma or dot as decimal separator
    - Strips currency symbols and spaces
    - Returns -1 if parsing fails (caller can ignore such entries)
    """
    if not price_str:
        return -1
    s = price_str.strip()
    # Remove euro symbol and spaces
    s = s.replace("€", "").replace("EUR", "").strip()
    # Replace comma with dot for float parsing
    s = s.replace(",", ".")
    # Keep only digits and at most one dot
    s = re.sub(r"[^0-9.]", "", s)
    if not s:
        return -1
    try:
        if "." in s:
            value = float(s)
            return int(round(value * 100))
        else:
            # No decimal separator; assume whole euros
            return int(s) * 100
    except Exception:
        return -1
