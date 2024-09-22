from models.semantic import Insights, Ontology, TimeTracker, TasksManager, SalesFunnelB2B, CRM
from models.domain import (
    WorkersRepository,
    ClientsRepository,
    CasesRepository,
    ProjectsRepository,
    SponsorsRepository,
    ProductsOrServicesRepository
)

from models.helpers.weeks import Weeks

import pandas as pd
from models.base.powerdataframe import SummarizablePowerDataFrame

from backend.decorators import cache
from datetime import datetime


class OmniModels:
    def __init__(self):
        self.ontology = Ontology()
        self.tracker = TimeTracker(ontology=self.ontology)
        self.insights = Insights()
        self.tasksmanager = TasksManager()
        self.salesfunnel = SalesFunnelB2B(ontology=self.ontology)
        self.crm = CRM(pipedrive=self.salesfunnel.pipedrive)

        self.workers: WorkersRepository = WorkersRepository(self.ontology, self.tracker, self.insights, self.tasksmanager, self.salesfunnel)
        self.clients = ClientsRepository(self.ontology, self.tracker, self.workers)
        self.cases = CasesRepository(self.ontology, self.tracker, self.clients)
        self.projects = ProjectsRepository(self.tasksmanager)
        self.sponsors = SponsorsRepository(self.cases, self.crm)
        self.products_or_services = ProductsOrServicesRepository(self.ontology)

    def get_tasks_for_worker_df(self, worker_id) -> list:
        worker = self.workers.get_by_id(worker_id)
        todoist_worker_id = worker.todoist_user_id

        tasks = self.projects.get_tasks_for(todoist_worker_id)
        sortedtasks = sorted(tasks, key=lambda task: task.due or datetime.max)

        data = [
            task.dict()
            for task in sortedtasks
        ]

        df = pd.DataFrame(data)

        def enrich_row(row):
            name = self.projects.get_by_id(row['project_id']).name
            row['project_name'] = name
            url = f'https://todoist.com/showProject?id={row["project_id"]}'
            row['project'] = f"<a href='{url}'>{name}</a>"
            return row

        df = df.apply(enrich_row, axis=1)

        return SummarizablePowerDataFrame(df)

    @cache
    def get_salesfunnelb2b_df(self) -> SummarizablePowerDataFrame:
        deals = self.salesfunnel.active_deals
        data = [
            deal.dict()
            for deal in deals
        ]
        df = pd.DataFrame(data)
        def enrich_row(row):
            worker = self.workers.get_by_pipedrive_user_id(row['account_manager_id'])
            row['account_manager_omni_url'] = worker.omni_url if worker else None
            row['account_manager'] = f"<a href='{worker.omni_url}'>{worker.name}</a>"
            return row

        df = df.apply(enrich_row, axis=1)
        df.sort_values(by='stage_order_nr', inplace=True)
        result = (SummarizablePowerDataFrame(df))

        return result

    @cache
    def get_last_six_weeks_am_activities_df(self):
        starting, ending = Weeks.get_n_weeks_dates(6)
        activities = self.salesfunnel.get_activities(starting, ending)

        clients = self.salesfunnel.pipedrive.fetch_clients()
        clients = {client.id: client.name for client in clients}

        data = [
            a.dict()
            for a in activities
        ]

        df = pd.DataFrame(data)

        df['due_month'] = df['due_date'].map(lambda x: x.month)
        df['due_day'] = df['due_date'].map(lambda x: x.day)
        df['due_year'] = df['due_date'].map(lambda x: x.year)

        df['update_month'] = df['update_time'].map(lambda x: x.month)
        df['update_day'] = df['update_time'].map(lambda x: x.day)
        df['update_year'] = df['update_time'].map(lambda x: x.year)

        def enrich_row(row):
            if pd.isna(row['org_id']):
                row['client_name'] = None
            else:
                row['client_name'] = clients[row['org_id']] if row['org_id'] else None

            return row

        df = df.apply(enrich_row, axis=1)

        result = (SummarizablePowerDataFrame(df))

        return result
