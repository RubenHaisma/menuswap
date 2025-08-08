import aiohttp, asyncio, hashlib, os
from pathlib import Path
from typing import Optional, Tuple
from .config import USER_AGENT, REQUEST_TIMEOUT_SECONDS, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL, R2_BUCKET, R2_PUBLIC_BASE_URL
from .log import get_logger
from mimetypes import guess_extension
import boto3
from botocore.config import Config as BotoConfig

DOWNLOAD_DIR = Path("data/downloads")

async def head(session, url):
    log = get_logger("fetch")
    try:
        # Return the response without closing the context so callers can read it
        r = await session.head(url, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
        return r
    except Exception:
        log.debug(f"HEAD failed: {url}")
        return None

async def get(session, url, etag=None, last_modified=None):
    log = get_logger("fetch")
    headers = {}
    if etag: headers["If-None-Match"] = etag
    if last_modified: headers["If-Modified-Since"] = last_modified
    try:
        # Return the response without closing the context so callers can read it
        r = await session.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
        return r
    except Exception:
        log.debug(f"GET failed: {url}")
        return None

async def download_menu_source(menu_id: str, url: str, session: Optional[aiohttp.ClientSession] = None) -> Optional[Tuple[str, str, str]]:
    """Download the menu source and write it to disk.

    Returns (menu_id, checksum, file_path) on success, or None on failure.
    DB updates are deliberately handled by the caller to allow batching.
    """
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    owns_session = False
    if session is None:
        session = aiohttp.ClientSession(headers={"User-Agent": USER_AGENT})
        owns_session = True

    log = get_logger("fetch")
    try:
        # Basic retry with exponential backoff and jitter for transient connection issues
        max_retries = 3
        backoff_base = 0.5
        last_exc: Optional[Exception] = None
        r = None
        content: Optional[bytes] = None

        for attempt in range(max_retries + 1):
            r = await get(session, url)
            if not r:
                last_exc = last_exc or Exception("GET returned None")
            else:
                try:
                    if r.status >= 400:
                        return None
                    content = await r.read()
                    break
                except Exception as e:
                    last_exc = e
            # backoff before next attempt
            if attempt < max_retries:
                sleep_seconds = backoff_base * (2 ** attempt) + (0.1 * attempt)
                await asyncio.sleep(sleep_seconds)

        if content is None:
            log.debug(f"Failed to download after retries: {url} ({last_exc})")
            return None

        checksum = hashlib.sha256(content).hexdigest()
        ctype = (r.headers.get("content-type", "application/octet-stream") if r else "application/octet-stream").split(";")[0]
        ext = guess_extension(ctype) or ".bin"
        fname = f"{menu_id}-{checksum[:8]}{ext}"
        if R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_ENDPOINT_URL and R2_BUCKET:
            # Upload to Cloudflare R2 (S3 compatible)
            log.debug(f"Uploading to R2: {fname}")
            s3 = boto3.client(
                "s3",
                aws_access_key_id=R2_ACCESS_KEY_ID,
                aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                endpoint_url=R2_ENDPOINT_URL,
                config=BotoConfig(signature_version="s3v4"),
            )
            s3.put_object(Bucket=R2_BUCKET, Key=fname, Body=content, ContentType=ctype)
            if R2_PUBLIC_BASE_URL:
                fpath = f"{R2_PUBLIC_BASE_URL.rstrip('/')}/{fname}"
            else:
                fpath = f"s3://{R2_BUCKET}/{fname}"
        else:
            fpath = DOWNLOAD_DIR / fname
            with open(fpath, "wb") as f:
                f.write(content)
            fpath = str(fpath)

        return (menu_id, checksum, str(fpath))
    finally:
        try:
            if 'r' in locals() and r is not None:
                r.release()
        except Exception:
            pass
        if owns_session:
            await session.close()
