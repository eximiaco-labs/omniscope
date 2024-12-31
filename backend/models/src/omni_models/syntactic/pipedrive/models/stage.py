from datetime import datetime
from pydantic import BaseModel


class Stage(BaseModel):
    id: int
    order_nr: int
    name: str
    active_flag: bool
    deal_probability: int
    pipeline_id: int
    rotten_flag: bool
    rotten_days: int
    add_time: datetime
    update_time: datetime
    pipeline_name: str
    pipeline_deal_probability: bool 