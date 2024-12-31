from typing import Optional, List
from pydantic import BaseModel, field_validator
from datetime import datetime

class Task(BaseModel):
    id: str
    name: str
    due_on: Optional[datetime] = None
    projects: List[str]
    
    @field_validator('due_on', mode='before')
    @classmethod
    def validate_due_on(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d")
        return value

    class Config:
        populate_by_name = True 