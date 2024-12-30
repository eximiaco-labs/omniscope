from datetime import datetime
from typing import Dict

from omni_models.base.semanticmodel import SemanticModel
from omni_models.semantic import Ontology
from omni_models.syntactic import Everhour, User, Client
from omni_utils.decorators.c4 import c4_external_system
from omni_shared.settings import api_settings
from omni_utils.helpers.weeks import Weeks

from .models.appointment import Appointment
from .models.project import Project

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