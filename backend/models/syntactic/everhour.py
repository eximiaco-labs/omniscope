import requests
from typing import Any, Dict, Optional, Literal, List

from pydantic import BaseModel, conint, validator, Field
from datetime import datetime

import pytz

from decorators import cache
import models.helpers.slug as slug


class User(BaseModel):
    id: int
    name: Optional[str] = None
    created_at: datetime = Field(alias='createdAt')
    status: Literal['active', 'invited', 'pending', 'removed']

    @property
    def slug(self) -> str:
        return slug.generate(self.name)


class Project(BaseModel):
    id: str
    platform: str
    name: str
    created_at: datetime = Field(alias='createdAt')
    status: str
    client_id: Optional[int] = Field(None, alias='client')

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


class Client(BaseModel):
    id: int
    projects: List[str]
    name: str
    created_at: datetime = Field(alias='createdAt')
    status: str

    @validator('created_at', pre=True)
    def parse_created_at(cls, value):
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
        return result

    @property
    def is_squad(self) -> bool:
        return 'squad' in self.name.lower()

    @property
    def is_eximiaco(self) -> bool:
        return 'eximiaco' in self.name.lower()

    class Config:
        populate_by_name = True


class Appointment(BaseModel):
    id: int
    created_at: datetime
    date: datetime
    user_id: int
    comment: Optional[str] = None
    time: conint(ge=0)
    project_id: str

    @property
    def created_at_sp(self) -> datetime:
        utc_timezone = pytz.utc
        utc_time = utc_timezone.localize(self.created_at)
        sp_timezone = pytz.timezone('America/Sao_Paulo')
        sp_time = utc_time.astimezone(sp_timezone)
        return sp_time

    class Config:
        population_by_name = True

    @staticmethod
    def from_json(json):
        return Appointment(
            id=json['id'],
            created_at=json['createdAt'],
            date=datetime.strptime(json['date'], "%Y-%m-%d"),
            comment=json['comment'] if 'comment' in json else None,
            user_id=json['user'],
            time=int(json['time']),
            project_id=json['task']['projects'][0]
        )


class Everhour:

    def __init__(self, api_token: str):
        self.session = requests.Session()
        self.api_token = api_token
        self.base_url = "https://api.everhour.com/"

    def fetch(self, entity: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        if params is None:
            params = {}

        url = f"{self.base_url}{entity}"
        headers = {
            'Content-Type': 'application/json',
            'X-Api-Key': self.api_token
        }

        response = self.session.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()

    @cache
    def fetch_all_users(self) -> Dict[int, User]:
        json = self.fetch('team/users')
        result = {
            int(user_data['id']): User(**user_data)
            for user_data in json
        }
        return result

    def fetch_appointments(self, starting: datetime, ending: datetime) -> List[Appointment]:
        params = {
            'from': starting.strftime('%Y-%m-%d'),
            'to': ending.strftime('%Y-%m-%d'),
            "limit": 10000,
            "page": 1
        }

        json = self.fetch("team/time", params)
        return [
            Appointment.from_json(ap)
            for ap in json
        ]

    @cache
    def fetch_all_projects(self, status: Optional[str] = None) -> List[Project]:
        json = self.fetch_all_projects_json(status)

        return [
            Project(**p)
            for p in json
        ]

    def fetch_all_projects_json(self, status: Optional[str] = None):
        params = {
            "limit": 10000,
            "page": 1,
            "status": status
        }
        json = self.fetch("projects", params)
        return json

    @cache
    def fetch_all_clients(self) -> List[Client]:
        params = {
            "limit": 10000,
            "page": 1
        }

        json = self.fetch("clients", params)

        return [
            Client(**c)
            for c in json
        ]

    # def _fetch_and_convert_to_df(self, entity: str, params: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
    #     data_json = self.fetch(entity, params)
    #     if data_json is not None:
    #         return pd.DataFrame(data_json)
    #     else:
    #         return pd.DataFrame()  # Return an empty DataFrame if the fetch fails

    def __del__(self):
        self.session.close()
