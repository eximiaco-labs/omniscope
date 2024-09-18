from models.semantic import TasksManager, Project
from typing import List, Dict, Optional


class ProjectsRepository:
    def __init__(self, tasks_manager: Optional[TasksManager] = None):
        self._tasks_manager = tasks_manager if tasks_manager is not None else TasksManager()

    def get_all(self) -> Dict[int, Project]:
        return {
            project.id: project
            for project in self._tasks_manager.projects
        }

    def get_by_id(self, project_id: int) -> Optional[Project]:
        return next(
            (project
             for project in self._tasks_manager.projects
             if project.id == project_id
             ),
            None
        )

    def get_tasks_for(self, todoist_user_id: int):
        return [task for project in self._tasks_manager.projects for task in project.tasks if
                task.assignee_id == todoist_user_id]
