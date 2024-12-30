from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, HttpUrl


class ContactInfo(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    primary: bool


class PictureInfo(BaseModel):
    item_type: str
    item_id: int
    active_flag: bool
    add_time: datetime
    pictures: Dict[str, HttpUrl]


class Person(BaseModel):
    id: Optional[int] = None
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    active_flag: bool

    org_name: Optional[str] = None
    job_title: Optional[str] = None

    phone: List[ContactInfo] = None
    email: List[ContactInfo] = None
    primary_email: Optional[str] = None

    picture_id: Optional[PictureInfo] = None

    owner_name: Optional[str] = None

    open_deals_count: Optional[int] = None
    closed_deals_count: Optional[int] = None
    activities_count: Optional[int] = None
    done_activities_count: Optional[int] = None
    undone_activities_count: Optional[int] = None

    add_time: Optional[datetime] = None
    update_time: Optional[datetime] = None
    last_activity_date: Optional[datetime] = None
    next_activity_date: Optional[datetime] = None
    next_activity_time: Optional[str] = None

    @property
    def picture_url(self) -> Optional[HttpUrl]:
        if self.picture_id and self.picture_id.pictures:
            return self.picture_id.pictures.get('128')
        return None

    @property
    def linkedin_url(self) -> Optional[str]:
        return getattr(self, '0edba6f94bfa791f3667a731969f89ce77692a93', None)

    @property
    def company(self) -> Optional[str]:
        return self.org_name

    @property
    def primary_phone(self) -> Optional[str]:
        primary_phone = next((p.value for p in self.phone if p.primary), None)
        return primary_phone or (self.phone[0].value if self.phone else None) 