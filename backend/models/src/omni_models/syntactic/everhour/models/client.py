from typing import List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import omni_utils.helpers.slug as slug

class Client(BaseModel):
    id: int
    projects: List[str]
    name: str
    created_at: datetime = Field(alias='createdAt')
    status: str
    
    @field_validator('created_at', mode='before')
    @classmethod
    def validate_created_at(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return value
    
    @property
    def slug(self) -> str:
        return slug.generate(self.name)

    @property
    def normalized_name(self) -> str:
        if not self.name:
            return None

        result = self.name.lower()
        result = result.replace(' - squad', '')
        result = result.replace(' - SE', '')

        return result

    @property
    def is_squad(self) -> bool:
        return not self.is_handson and ('squad' in self.name.lower())

    @property
    def is_handson(self):
        return self.name.lower().endswith(' - se')

    @property
    def is_eximiaco(self) -> bool:
        return 'eximiaco' in self.name.lower()

    class Config:
        populate_by_name = True 