from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

from .user import User
from .person import Person
from .organization import Organization


class Deal(BaseModel):
    id: int
    creator_user_id: User
    user_id: User
    person_id: Optional[Person]
    org_id: Optional[Organization]
    stage_id: int
    title: str
    value: float
    acv: Optional[float]
    mrr: Optional[float]
    arr: Optional[float]
    currency: str
    add_time: datetime
    update_time: datetime
    stage_change_time: Optional[datetime]
    active: bool
    deleted: bool
    status: str
    probability: Optional[float]
    next_activity_date: Optional[date]
    next_activity_time: Optional[str]
    next_activity_id: Optional[int]
    last_activity_id: Optional[int]
    last_activity_date: Optional[date]
    lost_reason: Optional[str]
    visible_to: str
    close_time: Optional[datetime]
    pipeline_id: int
    won_time: Optional[datetime]
    first_won_time: Optional[datetime]
    lost_time: Optional[datetime]
    products_count: int
    files_count: int
    notes_count: int
    followers_count: int
    email_messages_count: int
    activities_count: int
    done_activities_count: int
    undone_activities_count: int
    participants_count: int
    expected_close_date: Optional[date]
    last_incoming_mail_time: Optional[datetime]
    last_outgoing_mail_time: Optional[datetime]
    label: Optional[str]
    local_won_date: Optional[date]
    local_lost_date: Optional[date]
    local_close_date: Optional[date]
    origin: str
    origin_id: Optional[str]
    channel: Optional[int]
    channel_id: Optional[str]
    stage_order_nr: int
    person_name: Optional[str]
    org_name: Optional[str]
    next_activity_subject: Optional[str]
    next_activity_type: Optional[str]
    next_activity_duration: Optional[str]
    next_activity_note: Optional[str]
    formatted_value: str
    weighted_value: float
    formatted_weighted_value: str
    weighted_value_currency: str
    rotten_time: Optional[datetime]
    owner_name: str
    cc_email: str
    org_hidden: bool
    person_hidden: bool
    everhour_id: Optional[str] = Field(alias="46bcd25adcfe725f7191739a91fffdd2a6f82d2f")