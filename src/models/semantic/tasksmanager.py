from settings import api_settings
from datetime import datetime

from models.base.semanticmodel import SemanticModel
from models.syntactic import Todoist
from models.base.powerdataframe import PowerDataFrame
from decorators import c4_external_system

import models.syntactic.todoist as t

from models.dashboard.x9 import x9

from typing import List, Optional
from pydantic import BaseModel


class Task(BaseModel):
    id: int
    assignee_id: Optional[int]
    project_id: int
    content: str
    description: str
    is_completed: bool
    due: Optional[datetime]

    @property
    def is_late(self) -> bool:
        return not self.is_completed and self.due and self.due < datetime.now()

    @classmethod
    def from_todoist_task(cls, task: t.Task):
        def parse_datetime(datetime_string):
            if 'T' in datetime_string:
                return datetime.strptime(datetime_string, "%Y-%m-%dT%H:%M:%S")
            else:
                return datetime.strptime(datetime_string, "%Y-%m-%d")

        return cls(
            id=task.id,
            assignee_id=task.responsible_uid,
            project_id=task.project_id,
            content=task.content,
            description=task.description,
            is_completed=task.checked,
            due=parse_datetime(task.due['date']) if task.due else None,
        )


class Project(BaseModel):
    id: int
    name: str
    folder: Optional[str] = None
    is_favorite: bool
    # url: Optional[AnyUrl]
    tasks: Optional[List[Task]] = []

    @property
    def errors(self):
        result = []

        if self.number_of_tasks == 0:
            result.append("NO TASKS")

        if self.has_tasks_with_no_assignee:
            result.append("TASKS WITH NO ASSIGNEE")

        if self.has_late_tasks:
            result.append("LATE TASKS")

        return result

    @property
    def has_tasks_with_no_due_date(self) -> bool:
        result = any(task.due is None for task in self.tasks)
        return result

    @property
    def number_of_tasks(self) -> int:
        return len(self.tasks)

    @property
    def expected_due_date(self) -> datetime:
        data = [
            task.due
            for task in self.tasks
            if task.due is not None
        ]

        return max(
            data
        ) if any(data) else None

    @property
    def has_tasks_with_no_assignee(self) -> bool:
        return any(task.assignee_id is None for task in self.tasks)

    @property
    def has_late_tasks(self) -> bool:
        return any(task.is_late for task in self.tasks)


@c4_external_system(
    "Task Management (TodoIst)",
    "Organizes non-routine tasks such as project-related tasks"
)
class TasksManager(SemanticModel):
    def __init__(self, todoist=None, api_token=None):
        api_token = api_token or api_settings["todoist_api_key"]
        self.todoist = todoist or Todoist(api_token)

    @property
    def projects(self) -> List[Project]:
        result = []
        todoist_projects = self.todoist.fetch_projects()
        todoist_folders = {
            folder.id: folder.name
            for folder in self.todoist.fetch_folders()
        }

        for todoist_project in todoist_projects:
            if not todoist_project.shared:
                continue

            d = todoist_project.dict()
            p = Project(**d)
            p.tasks = self.get_tasks(p.id)

            if todoist_project.folder_id:
                p.folder = todoist_folders[todoist_project.folder_id]

            result.append(p)
        return result

    def get_tasks(self, project_id: str) -> List[Task]:
        todoist_tasks = self.todoist.fetch_tasks()
        tasks = [
            Task.from_todoist_task(task)
            for task in todoist_tasks
            if task.project_id == project_id and not task.is_deleted
        ]

        # todoist_completed_tasks = self.todoist.fetch_completed_tasks(project_id)
        # completed_tasks = [
        #     Task.from_todoist_task(task)
        #     for task in todoist_completed_tasks
        # ]

        return tasks

    @property
    def users(self):
        return self.todoist.fetch_collaborators()

    @property
    def common_queries(self):
        return CommonQueries(self)


class ProjectsDataFrame(PowerDataFrame):
    def __init__(self, data):
        super().__init__(data)

    def to_ui(self):
        columns = ['Name']
        df = self.data[columns].copy()
        df.columns = ['Project']
        return df


class CommonQueries:
    def __init__(self, tm: TasksManager):
        self.tm = tm or TasksManager()

    @x9(family='todoist')
    def find_projects_without_tasks(self):
        return (self.tm.projects
                .filter_by(by='HasTasks', equals_to=False)
                )

    @x9(family='todoist')
    def find_projects_with_late_tasks(self):
        return (self.tm.projects
                .filter_by(by='HasLateTasks', equals_to=False)
                )

    @x9(family='todoist')
    def find_projects_without_due(self):
        return (self.tm.projects
                .filter_by(by='AllTasksHaveDue', equals_to=False)
                )
