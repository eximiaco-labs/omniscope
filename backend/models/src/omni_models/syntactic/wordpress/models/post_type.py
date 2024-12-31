from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class PostType(BaseModel):
    description: str
    hierarchical: bool
    has_archive: bool
    name: str
    slug: str
    icon: Optional[str]
    taxonomies: List[str]
    rest_base: str
    rest_namespace: str
    _links: Dict[str, List[Dict[str, Any]]] 