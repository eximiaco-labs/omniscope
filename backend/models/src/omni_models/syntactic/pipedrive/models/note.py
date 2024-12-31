from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Note(BaseModel):
    id: int
    user_id: int
    deal_id: Optional[int]
    person_id: Optional[int]
    org_id: Optional[int]
    lead_id: Optional[int]
    content: str
    add_time: datetime
    update_time: datetime
    active_flag: bool
    pinned_to_deal_flag: bool
    pinned_to_person_flag: bool
    pinned_to_organization_flag: bool
    pinned_to_lead_flag: bool
    last_update_user_id: Optional[int]
    lead: Optional[int]
    type: str = "Note" 