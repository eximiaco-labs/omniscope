from typing import Optional
import pytz

from omni_utils.helpers.weeks import Weeks
import omni_models.syntactic.everhour as e
from .project import Project

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
        data = super().model_dump()
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