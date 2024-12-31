from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from omni_utils.helpers.weeks import Weeks

class Activity(BaseModel):
    id: int
    type: str
    subject: Optional[str]
    user_id: int
    due_date: date
    update_time: datetime
    org_id: Optional[int] = None
    person_id: Optional[int] = None
    deal_id: Optional[int] = None

    deal_title: Optional[str] = None
    account_manager_name: Optional[str] = None
    account_manager: Optional[str] = None

    due_week: Optional[str] = None

    @property
    def update_week(self):
        return Weeks.get_week_string(self.update_time)

    @property
    def is_correct(self):
        return self.due_week == self.update_week 