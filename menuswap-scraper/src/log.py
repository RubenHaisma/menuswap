import logging
import os
from typing import Optional

_configured = False

def setup_logging(level: Optional[str] = None) -> None:
    global _configured
    if _configured:
        return
    level_name = level or os.getenv("LOG_LEVEL", "INFO")
    numeric_level = getattr(logging, level_name.upper(), logging.INFO)
    logging.basicConfig(
        level=numeric_level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    _configured = True

def get_logger(name: str) -> logging.Logger:
    setup_logging()
    return logging.getLogger(name)


