from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
import omni_utils.helpers.slug as slug

from .billing import Billing, Rate
from .budget import Budget

class Project(BaseModel):
    id: str
    platform: str
    name: str
    created_at: datetime = Field(alias='createdAt')
    status: str
    billing: Optional[Billing] = None
    client_id: Optional[int] = Field(None, alias='client')
    budget: Optional[Budget] = None
    rate: Optional[Rate] = None
    users: Optional[List[int]] = None

    @property
    def slug(self) -> str:
        return slug.generate(self.name)

    @validator('created_at', pre=True)
    def parse_created_at(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d")
        return value

    class Config:
        populate_by_name = True 