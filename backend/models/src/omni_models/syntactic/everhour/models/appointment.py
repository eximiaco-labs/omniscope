from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import pytz

class Appointment(BaseModel):
    id: int
    created_at: datetime = Field(alias='createdAt')
    date: datetime
    user_id: int = Field(alias='user')
    comment: Optional[str] = None
    time: int = Field(ge=0)
    project_id: str = Field(alias='task_project')

    @field_validator('created_at', mode='before')
    @classmethod
    def validate_created_at(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return value

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d")
        return value

    @field_validator('project_id', mode='before')
    @classmethod
    def extract_project_id(cls, value, values):
        if isinstance(value, dict) and 'projects' in value:
            return value['projects'][0]
        return value

    @property
    def created_at_sp(self) -> datetime:
        utc_timezone = pytz.utc
        utc_time = utc_timezone.localize(self.created_at)
        sp_timezone = pytz.timezone('America/Sao_Paulo')
        sp_time = utc_time.astimezone(sp_timezone)
        return sp_time

    class Config:
        populate_by_name = True 