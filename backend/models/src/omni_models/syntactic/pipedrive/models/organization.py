from typing import Optional, List
from pydantic import BaseModel


class Organization(BaseModel):
    name: str
    people_count: int
    owner_id: int
    address: Optional[str]
    active_flag: bool
    cc_email: str
    label_ids: List[int]
    owner_name: str
    value: int 