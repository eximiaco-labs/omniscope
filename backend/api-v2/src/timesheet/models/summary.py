from typing import List
from pydantic import BaseModel

from .weekly_hours import WeeklyHours

class TimesheetSummary(BaseModel):
    total_entries: int = 0
    total_hours: float = 0
    unique_clients: int = 0
    unique_workers: int = 0
    unique_cases: int = 0
    unique_working_days: int = 0
    unique_sponsors: int = 0
    unique_account_managers: int = 0
    unique_weeks: int = 0
    average_hours_per_entry: float = 0
    std_dev_hours_per_entry: float = 0
    average_hours_per_day: float = 0
    std_dev_hours_per_day: float = 0
    average_hours_per_worker: float = 0
    std_dev_hours_per_worker: float = 0
    average_hours_per_client: float = 0
    std_dev_hours_per_client: float = 0
    average_hours_per_case: float = 0
    std_dev_hours_per_case: float = 0
    average_hours_per_sponsor: float = 0
    std_dev_hours_per_sponsor: float = 0
    average_hours_per_account_manager: float = 0
    std_dev_hours_per_account_manager: float = 0
    average_hours_per_week: float = 0
    std_dev_hours_per_week: float
    total_squad_hours: float = 0
    total_consulting_hours: float = 0
    total_internal_hours: float = 0
    total_hands_on_hours: float = 0
    weekly_hours: List[WeeklyHours] = [] 