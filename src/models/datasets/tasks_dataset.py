from datetime import datetime
from typing import List, Tuple

import pandas as pd

from decorators.cache import cache
from models.base.powerdataframe import SummarizablePowerDataFrame
from models.datasets.omni_dataset import OmniDataset
from models.omnimodels import OmniModels


class TasksDataset(OmniDataset):
    def get_all_fields(self) -> List[str]:
        return ['Id', 'AssigneeId', 'ProjectId', 'Content',
                'IsCompleted', 'Due', 'ProjectName', 'Project', 'ProjectFolder',
                'IsLate', 'WorkerName', 'Status']

    def get_treemap_path(self) -> Tuple[str, List[str]]:
        return 'Unit', ['ProjectFolder', 'ProjectName']

    def get_filterable_fields(self) -> List[str]:
        return ['ProjectFolder', 'ProjectName', 'WorkerName', 'Status']

    def get_common_fields(self) -> List[str]:
        return ['ProjectFolder', 'ProjectName', 'WorkerName', 'Content', 'Due', 'Status']

    def __init__(self, models: OmniModels = None):
        self.models = models or OmniModels()

    @cache
    def get(self) -> SummarizablePowerDataFrame:
        projects = self.models.projects.get_all().values()

        data = [
            task.dict()
            for project in projects
            for task in project.tasks
        ]

        df = pd.DataFrame(data)

        def enrich_row(row):
            project = self.models.projects.get_by_id(row['project_id'])
            name = project.name
            folder = project.folder
            row['project_name'] = name
            url = f'https://todoist.com/showProject?id={row["project_id"]}'
            row['project'] = f"<a href='{url}'>{name}</a>"
            row['project_folder'] = folder
            row['is_late'] = row['due'] < datetime.now()
            row['status'] = 'dalayed' if row['due'] < datetime.now() else 'on time'

            worker = self.models.workers.get_by_todoist_id(row['assignee_id'])
            row['worker_name'] = worker.name if worker else None
            return row

        df = df.apply(enrich_row, axis=1)

        return SummarizablePowerDataFrame(df)
