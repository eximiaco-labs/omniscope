import requests
from pydantic import BaseModel
from typing import List, Optional

from decorators import cache
import models.helpers.slug as slug


class Collaborator(BaseModel):
    id: int
    full_name: str

    @property
    def slug(self):
        return slug.generate(self.full_name)


class Task(BaseModel):
    id: int
    user_id: int
    project_id: int
    content: str
    description: str
    priority: int
    due: Optional[dict]
    parent_id: Optional[int]
    child_order: int
    section_id: Optional[int]
    collapsed: bool
    labels: List[str]
    added_by_uid: int
    assigned_by_uid: Optional[int]
    responsible_uid: Optional[int]
    checked: bool
    is_deleted: bool
    sync_id: Optional[int]
    added_at: str
    duration: Optional[dict]


class Project(BaseModel):
    id: int
    name: str
    color: str
    parent_id: Optional[int]
    child_order: int
    collapsed: bool
    shared: Optional[bool] = False
    folder_id: Optional[int] = None
    is_deleted: bool
    is_archived: bool
    is_favorite: bool
    view_style: str


class Folder(BaseModel):
    id: int
    name: str


class Todoist:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = 'https://api.todoist.com/sync/v9'

    def _get_headers(self):
        return {
            'Authorization': f'Bearer {self.api_token}'
        }

    @cache
    def sync(self, sync_token='*'):
        url = f'{self.base_url}/sync'
        params = {
            'resource_types': '["all"]',
            'sync_token': sync_token
        }
        response = requests.post(url, headers=self._get_headers(), json=params)
        response.raise_for_status()
        return response.json()

    @cache
    def sync_completed(self, project_id: int):
        url = f'{self.base_url}/completed/get_all'
        response = requests.post(url, headers=self._get_headers(), params={'project_id': project_id})
        response.raise_for_status()
        return response.json()

    def fetch_projects(self) -> List[Project]:
        data = self.sync()
        projects_data = data['projects']
        return [Project(**project) for project in projects_data]

    def fetch_folders(self):
        data = self.sync()
        folders_data = data['folders']
        return [Folder(**folder) for folder in folders_data]

    def fetch_tasks(self) -> List[Task]:
        data = self.sync()
        tasks_data = data['items']
        return [Task(**task) for task in tasks_data]

    def fetch_completed_tasks(self, project_id: int) -> List[Task]:
        url = f'{self.base_url}/archive/items'
        params = {
            'project_id': project_id,
            'sync_token': '*'
        }
        completed_tasks = []
        while True:
            response = requests.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            data = response.json()

            tasks_data = data['items']
            completed_tasks.extend([Task(**task) for task in tasks_data])

            if data.get('has_more'):
                params['cursor'] = data['next_cursor']
            else:
                break

        return completed_tasks

    def fetch_collaborators(self) -> List[Collaborator]:
        data = self.sync()
        collaborators_data = data['collaborators']
        return [Collaborator(id=collab['id'], full_name=collab['full_name']) for collab in collaborators_data]
