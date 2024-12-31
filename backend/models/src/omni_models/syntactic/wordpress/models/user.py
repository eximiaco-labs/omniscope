from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Any

class User(BaseModel):
    id: int
    name: str
    description: str
    link: HttpUrl
    slug: str
    avatar_urls: Dict[str, HttpUrl]
    _links: Dict[str, List[Dict[str, Any]]] 