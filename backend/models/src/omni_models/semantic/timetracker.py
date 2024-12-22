from datetime import datetime

import pandas as pd

from omni_models.base.powerdataframe import SummarizablePowerDataFrame
from omni_models.base.semanticmodel import SemanticModel
from omni_utils.helpers.weeks import Weeks
from omni_models.semantic import Ontology

from typing import Optional, Dict
from omni_models.syntactic import Everhour, User, Client
import omni_models.syntactic.everhour as e

from omni_utils.decorators.c4 import c4_external_system
from omni_shared.settings import api_settings

import pytz

class TimeBudget:
    hours: float
    period: str

class Project(e.Project):
    due_on: Optional[datetime] = None
    
    is_squad: Optional[bool] = False
    is_eximiaco: Optional[bool] = False
    is_handson: Optional[bool] = False
    
    @property
    def kind(self):
        if self.is_handson:
            return 'handsOn'
        if self.is_squad:
            return 'squad'
        if self.is_eximiaco:
            return 'internal'
        
        return 'consulting'

    @classmethod
    def from_base_instance(cls, base_instance: e.Project, client: Client):
        base_dict = base_instance.dict()
        base_dict['is_squad'] = client.is_squad if client else False
        base_dict['is_eximiaco'] = client.is_eximiaco if client else True
        base_dict['is_handson'] = client.is_handson if client else False

        if base_instance.name.lower().endswith('- se'):
            base_dict['is_handson'] = True

        if base_dict['is_handson']:
            base_dict['is_squad'] = False
            base_dict['is_eximiaco'] = False

        return cls(**base_dict)


class Appointment(e.Appointment):
    is_squad: Optional[bool] = False
    is_eximiaco: Optional[bool] = False
    is_handson: Optional[bool] = False

    rate: Optional[float] = 0

    @property
    def time_in_hs(self):
        return round(self.time / 3600, 1)

    @property
    def revenue(self):
        return self.rate * self.time_in_hs if self.rate else 0

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

        if self.is_handson:
            return 'HandsOn'

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
        data['revenue'] = self.revenue
        return data

    @classmethod
    def from_base_instance(cls, base_instance: e.Appointment, project: Project):
        base_dict = base_instance.dict()
        base_dict['is_squad'] = project.is_squad if project else False
        base_dict['is_eximiaco'] = project.is_eximiaco if project else True
        base_dict['is_handson'] = project.is_handson if project else False

        base_dict['rate'] = project.rate.rate / 100 if project.rate and project.rate.type == 'project_rate' else 0

        if base_dict['is_handson']:
            base_dict['is_squad'] = False

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
        all_endings = self.everhour.search_tasks('Encerramento')
        all_clients = self.all_clients

        result = {}
        for p in all_projects:
            client = all_clients[p.client_id] if p.client_id else None
            
            new_p = Project.from_base_instance(p, client)
            result[new_p.id] = new_p
            
        # Set project due dates from ending tasks
        for task in all_endings:
            for project_id in task.projects:
                if project_id in result:
                    result[project_id].due_on = task.due_on

        return result


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
