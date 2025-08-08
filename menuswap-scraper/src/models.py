from pydantic import BaseModel, HttpUrl
from typing import Optional

class SeedRestaurant(BaseModel):
    osm_id: str
    name: str
    city: Optional[str] = None
    address: Optional[str] = None
    website_url: Optional[str] = None
    lat: float
    lon: float
