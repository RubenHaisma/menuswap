from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OVERPASS_URL = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
USER_AGENT = os.getenv("USER_AGENT", "MenuSwapBot/0.1 (+https://example.com/bot-info)")
CONCURRENCY = int(os.getenv("CONCURRENCY", "10"))
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "12"))

# Dutch heuristics
MENU_HINT_WORDS = [
    "menukaart","menu","kaart","gerechten","dranken","wijn","lunch","diner","eten","spijskaart"
]

# Cloudflare R2 / S3-compatible storage
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")  # e.g. https://<accountid>.r2.cloudflarestorage.com
R2_BUCKET = os.getenv("R2_BUCKET", "menus")
R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL")  # optional public CDN/base URL to build object URLs

# Update mode: when true, allow updating existing restaurants/menus
UPDATE_MODE = os.getenv("UPDATE", "false").lower() in ("1", "true", "yes", "on")
