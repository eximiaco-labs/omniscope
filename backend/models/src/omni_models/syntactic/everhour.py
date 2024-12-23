import requests
from typing import Any, Dict, Optional, Literal, List

from bokeh.resources import BaseMode
from pydantic import BaseModel, conint, validator, Field
from datetime import datetime

import pytz

from omni_utils.decorators.cache import cache
import omni_utils.helpers.slug as slug


class User(BaseModel):
    id: int
    name: Optional[str] = None
    created_at: datetime = Field(alias='createdAt')
    status: Literal['active', 'invited', 'pending', 'removed']

    @property
    def slug(self) -> str:
        return slug.generate(self.name)

class Billing(BaseModel):
    type: Optional[str] = None
    fee: Optional[float] = None
    
class Rate(BaseModel):
    type: Optional[str] = None
    rate: Optional[float] = None

class Budget(BaseModel):
    type: Optional[str]=None
    budget: Optional[int]=None
    period: Optional[str]='general'

    @property
    def hours(self) -> float:
        if self.type != "time":
            return None
        return self.budget / 60 / 60

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

class Task(BaseModel):
    id: str
    name: str
    due_on: Optional[datetime] = None
    projects: List[str]
    
    @staticmethod
    def from_json(json):
        return Task(
            id=json['id'],
            name=json['name'],
            due_on=datetime.strptime(json['dueOn'], "%Y-%m-%d") if json.get('dueOn') else None,
            projects=json['projects']
        )

class Everhour:

    def __init__(self, api_token: str):
        self.session = requests.Session()
        self.api_token = api_token
        self.base_url = "https://api.everhour.com/"

    def fetch(self, entity: str, entity_id: Optional[str] = None, sub_entity: Optional[str] = None, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        if params is None:
            params = {}

        url = self.base_url + entity
        if entity_id:
            url += f"/{entity_id}"
        if sub_entity:
            url += f"/{sub_entity}"

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

        json = self.fetch("team/time", params=params)
        return [
            Appointment.from_json(ap)
            for ap in json
        ]

    @cache
    def fetch_all_projects(self, status: Optional[str] = None) -> List[Project]:
        params = {
            "limit": 10000,
            "page": 1
        }
        if status:
            params["status"] = status
            
        json = self.fetch("projects", params=params)
        return [
            Project(**p)
            for p in json
        ]

    @cache
    def fetch_project_tasks(self, project_id: str) -> List[Task]:
        params = {
            "limit": 10000,
            "page": 1
        }
        json = self.fetch(f"projects/{project_id}/tasks", params=params)
        return [
            Task.from_json(t)
            for t in json
        ]
        
    @cache
    def search_tasks(self, query: str) -> List[Task]:
        json = self._search_tasks_json(query)
        return [
            Task.from_json(t)
            for t in json
        ]

    def _search_tasks_json(self, query: str) -> List[Dict[str, Any]]:
        params = {
            #"limit": 10000,
            "query": query,
            "searchInClosed": False
        }
        json = self.fetch("tasks/search", params=params)
        return json
    
    @cache
    def fetch_all_clients(self) -> List[Client]:
        params = {
            "limit": 10000,
            "page": 1
        }

        json = self.fetch("clients", params=params)
        return [
            Client(**c)
            for c in json
        ]

    def __del__(self):
        self.session.close()
