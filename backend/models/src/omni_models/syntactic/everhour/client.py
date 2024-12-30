import requests
from typing import Dict, Optional, List, Any
from datetime import datetime

from omni_utils.decorators.cache import cache
from .models import User, Project, Task, Client, Appointment

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