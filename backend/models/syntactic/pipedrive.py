from datetime import datetime, date
from typing import Optional, List, Dict
from backend.decorators import cache

import requests
from pydantic import BaseModel, validator, HttpUrl


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


class User(BaseModel):
    id: int
    name: str
    email: str
    active_flag: bool


class Note(BaseModel):
    id: int
    user_id: int
    deal_id: Optional[int]
    person_id: Optional[int]
    org_id: Optional[int]
    lead_id: Optional[int]
    content: str
    add_time: datetime
    update_time: datetime
    active_flag: bool
    pinned_to_deal_flag: bool
    pinned_to_person_flag: bool
    pinned_to_organization_flag: bool
    pinned_to_lead_flag: bool
    last_update_user_id: Optional[int]
    lead: Optional[int]

    type: str = "Note"


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


class Organization(BaseModel):
    name: str
    people_count: int
    owner_id: int
    address: Optional[str]
    active_flag: bool
    cc_email: str
    label_ids: List[int]
    owner_name: str
    value: int


class Deal(BaseModel):
    id: int
    creator_user_id: User
    user_id: User
    person_id: Optional[Person]
    org_id: Organization
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
    origin_id: Optional[int]
    channel: Optional[int]
    channel_id: Optional[str]
    stage_order_nr: int
    person_name: Optional[str]
    org_name: str
    next_activity_subject: Optional[str]
    next_activity_type: Optional[str]
    next_activity_duration: Optional[str]
    next_activity_note: Optional[str]
    formatted_value: str
    weighted_value: float
    formatted_weighted_value: str
    weighted_value_currency: str
    rotten_time: datetime
    owner_name: str
    cc_email: str
    org_hidden: bool
    person_hidden: bool


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


class Client(BaseModel):
    id: int
    company_id: int
    name: str


class Pipedrive:
    def __init__(self, api_token):
        self.session = requests.Session()  # Use a session for connection pooling
        self.api_token = api_token

    def __fetch(self, entity, start=0, params=None):
        if params is None:
            params = {}
        url = f"https://api.pipedrive.com/v1/{entity}"

        # Set default query parameters
        params['api_token'] = self.api_token
        params['limit'] = 500
        params['start'] = start

        response = self.session.get(url, params=params)
        response.raise_for_status()  # Proper error handling
        return response.json()

    @staticmethod
    def __has_next_page(data):
        return data.get('additional_data', {}).get('pagination', {}).get('more_items_in_collection', False)

    def _fetch_all(self, entity, params=None):
        all_data = []
        start = 0

        while True:
            data = self.__fetch(entity, start, params)
            if data is None or 'data' not in data:
                break
            all_data.extend(data['data'])

            if not self.__has_next_page(data):
                break
            start = data.get('additional_data', {}).get('pagination', {}).get('next_start', 0)

        # Create DataFrame from all data at once
        return all_data

    @cache
    def fetch_active_deals_in_stage(self, stage_id):
        params = {
            'stage_id': stage_id,
            'status': 'open'
        }
        json = self._fetch_all('deals', params=params)

        return [Deal(**stage) for stage in json]

    @cache
    def fetch_stages_in_pipeline(self, pipeline_id):
        json = self._fetch_all('stages', params={'pipeline_id': pipeline_id})
        return [Stage(**stage) for stage in json]

    def fetch_activities(self, starting: datetime, ending: datetime):
        params = {
            'since': starting.strftime('%Y-%m-%d %H:%M:%S'),
            'until': ending.strftime('%Y-%m-%d %H:%M:%S'),
        }

        json = self._fetch_all('activities/collection', params=params)
        return [
            Activity(**activity)
            for activity in json
        ]

    @cache
    def fetch_people(self):
        params = {
            'fields': 'picture_id'
        }
        json = self._fetch_all('persons', params=params)
        return [Person(**person) for person in json]

    def fetch_notes(self, starting: datetime, ending: datetime) -> List[Note]:
        params = {
            'start_date': starting.strftime('%Y-%m-%d'),
            'end_date': ending.strftime('%Y-%m-%d'),
        }

        json = self._fetch_all('notes', params=params)

        return [
            Note(**n)
            for n in json
        ]

        return json

    def fetch_users(self):
        json = self._fetch_all('users')
        return [User(**user) for user in json]

    def fetch_clients(self):
        json = self._fetch_all('organizations')
        return [Client(**client) for client in json]
