from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, validator


class Activity(BaseModel):
    id: int
    done: bool
    type: str
    duration: Optional[int] = None
    subject: str
    company_id: int
    user_id: int
    conference_meeting_client: Optional[str] = None
    conference_meeting_url: Optional[str] = None
    conference_meeting_id: Optional[str] = None
    due_date: date
    due_time: Optional[str] = None
    busy_flag: bool
    add_time: datetime
    marked_as_done_time: Optional[datetime]
    public_description: Optional[str] = None
    location: Optional[str] = None
    org_id: Optional[int] = None
    person_id: Optional[int] = None
    deal_id: Optional[int] = None
    active_flag: bool
    update_time: datetime
    update_user_id: Optional[int]
    source_timezone: Optional[str] = None
    lead_id: Optional[int] = None
    location_subpremise: Optional[str] = None
    location_street_number: Optional[str] = None
    location_route: Optional[str] = None
    location_sublocality: Optional[str] = None
    location_locality: Optional[str] = None
    location_admin_area_level_1: Optional[str] = None
    location_admin_area_level_2: Optional[str] = None
    location_country: Optional[str] = None
    location_postal_code: Optional[str] = None
    location_formatted_address: Optional[str] = None
    project_id: Optional[int] = None

    @validator('duration', pre=True, always=True)
    def parse_duration(cls, v):
        if isinstance(v, str):
            try:
                # Tentativa de converter string no formato 'HH:MM:SS' para minutos
                h, m, s = map(int, v.split(':'))
                return h * 60 + m
            except ValueError:
                return None
        return v

    @validator('due_date', 'add_time', 'marked_as_done_time', 'update_time', pre=True)
    def parse_dates(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return datetime.strptime(v, '%Y-%m-%d')
        return v 