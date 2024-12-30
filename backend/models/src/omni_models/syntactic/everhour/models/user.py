from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import omni_utils.helpers.slug as slug

class User(BaseModel):
    id: int
    name: Optional[str] = None
    created_at: datetime = Field(alias='createdAt')
    status: Literal['active', 'invited', 'pending', 'removed']

    @property
    def slug(self) -> str:
        return slug.generate(self.name) 