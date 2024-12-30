from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Deal(BaseModel):
    id: int
    title: str
    stage_id: int
    stage_name: str
    stage_order_nr: int
    client_name: str
    account_manager_id: int
    account_manager_name: str
    add_time: Optional[datetime]
    update_time: Optional[datetime]
    days_since_last_update: Optional[int] = 0 