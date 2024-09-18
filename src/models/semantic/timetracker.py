from datetime import datetime

from settings import api_settings
import pandas as pd

from models.base.powerdataframe import PowerDataFrame, SummarizablePowerDataFrame
from models.base.semanticmodel import SemanticModel
from models.helpers.weeks import Weeks
from models.semantic import Ontology

from typing import Optional, Dict
from models.syntactic import Everhour, User, Client
import models.syntactic.everhour as e

from decorators import c4_external_system

import pytz


class Project(e.Project):
    is_squad: Optional[bool] = False
    is_eximiaco: Optional[bool] = False

    @classmethod
    def from_base_instance(cls, base_instance: e.Project, client: Client):
        base_dict = base_instance.dict()
        base_dict['is_squad'] = client.is_squad if client else False
        base_dict['is_eximiaco'] = client.is_eximiaco if client else True
        return cls(**base_dict)


class Appointment(e.Appointment):
    is_squad: Optional[bool] = False
    is_eximiaco: Optional[bool] = False

    @property
    def time_in_hs(self):
        return round(self.time / 3600, 1)

    @property
    def week(self) -> str:
        return Weeks.get_week_string(self.date)

    @property
    def created_at_week(self) -> str:
        return Weeks.get_week_string(self.created_at_sp)

    @property
    def kind(self) -> str:
        if self.is_eximiaco:
            return 'Internal'

        if self.is_squad:
            return 'Squad'

        return 'Consulting'

    @property
    def correctness(self):
        sp_timezone = pytz.timezone('America/Sao_Paulo')
        date_aware = self.date.replace(tzinfo=sp_timezone)
        difference = self.created_at_sp - date_aware
        days = difference.days
        if days == 0:
            return "OK"
        elif days == 1:
            return "Acceptable (1)"
        else:
            return f"WTF {days}"

    @property
    def is_lte(self):
        sp_timezone = pytz.timezone('America/Sao_Paulo')
        date_aware = self.date.replace(tzinfo=sp_timezone)
        difference = self.created_at_sp - date_aware
        days = difference.days
        return days > 2

    def to_dict(self):
        data = super().dict(by_alias=True)
        data['week'] = self.week
        data['time_in_hs'] = self.time_in_hs
        data['kind'] = self.kind
        data['week'] = self.week
        data['created_at_week'] = self.created_at_week
        data['correctness'] = self.correctness
        data['is_lte'] = self.is_lte
        return data

    @classmethod
    def from_base_instance(cls, base_instance: e.Appointment, project: Project):
        base_dict = base_instance.dict()
        base_dict['is_squad'] = project.is_squad if project else False
        base_dict['is_eximiaco'] = project.is_eximiaco if project else True
        return cls(**base_dict)


@c4_external_system('Time Tracker (Everhour)', 'Logs EximiaCo engagements, detailing all projects and hours worked')
class TimeTracker(SemanticModel):
    def __init__(self, everhour=None, ontology=None):
        api_key = api_settings["everhour_api_key"]
        self.everhour = everhour or Everhour(api_token=api_key)
        self.ontology = ontology or Ontology()
        self.context = None

    @property
    def active_workers(self) -> Dict[int, User]:
        all_users = self.everhour.fetch_all_users()
        active_users = {
            user_id: user
            for user_id, user in all_users.items()
            if user.status == 'active'
        }
        return active_users

    @property
    def all_clients(self) -> Dict[int, Client]:
        clients = self.everhour.fetch_all_clients()
        return {
            c.id: c
            for c in clients
        }

    def get_appointments(self, starting: datetime, ending: datetime):
        appointments = self.everhour.fetch_appointments(starting, ending)
        projects = self.all_projects

        return [
            Appointment.from_base_instance(ap, projects[ap.project_id])
            for ap in appointments
        ]

    def get_appointments_of_n_weeks(self, number_of_weeks=4):
        start, end = Weeks.get_n_weeks_dates(number_of_weeks)
        all_ap = self.get_appointments(start, end)
        return all_ap

    @property
    def all_projects(self):
        all_projects = self.everhour.fetch_all_projects()
        all_clients = self.all_clients

        result = {}
        for p in all_projects:
            client = all_clients[p.client_id] if p.client_id else None
            new_p = Project.from_base_instance(p, client)
            result[new_p.id] = new_p

        return result

    # def __get_everhour_case_associations(self):
    #     cases = self.ontology.cases.data[['ProjectEverhourCode', 'Title', 'Url']]
    #
    #     # Split the 'project_everhour_code' column and explode it into separate rows
    #     cases['ProjectEverhourCode'] = cases['ProjectEverhourCode'].str.split(';')
    #     cases = cases.explode('ProjectEverhourCode')
    #
    #     # Drop rows where 'project_everhour_code' is NaN or empty
    #     cases = cases.dropna(subset=['ProjectEverhourCode'])
    #     cases = cases[cases['ProjectEverhourCode'] != '']
    #
    #     # Drop duplicates and sort
    #     cases = cases.drop_duplicates(subset='ProjectEverhourCode').sort_values('ProjectEverhourCode')
    #
    #     cases.columns = ['Id', 'Name', 'Url']
    #
    #     return PowerDataFrame(cases)

    @property
    def common_queries(self):
        return self.__commonqueries


class AppointmentsDataFrame(SummarizablePowerDataFrame):
    def __init__(self, appointments: pd.DataFrame):
        super().__init__(appointments)

    def filter_wtfs(self):
        return (self
                .filter_by(by='Correctness', not_equals_to='OK')
                .filter_by(by='Correctness', not_equals_to='Acceptable (1)')
                .filter_by(by='Correctness', not_starts_with='WTF -')
                )

    def to_ui(self):
        columns = ['WorkerName', 'WorkingTime', 'Date', 'Week', 'CreatedAt', 'CreationWeek',
                   'ClientOntologyName', 'AgentName']
        df = self.data[columns].copy()
        df['Date'] = pd.to_datetime(df['Date'])
        df['Date'] = df['Date'].dt.strftime('%d/%m')
        df['CreatedAt'] = pd.to_datetime(df['CreatedAt'])
        df['CreatedAt'] = df['CreatedAt'].dt.strftime('%d/%m')

        df.columns = pd.MultiIndex.from_tuples(
            [
                ('Who', ''),
                ('Time (Hs)', ''),
                ('Done', 'Date'),
                ('Done', 'Week'),
                ('Registered', 'Date'),
                ('Registered', 'Week'),
                ('Client', ''),
                ('Agent', '')
            ]
        )

        return df
