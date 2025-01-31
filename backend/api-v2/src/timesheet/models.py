from __future__ import annotations
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from core.generator import FilterableField
from core.fields import Id

class WeeklyHours(BaseModel):
    week: str
    hours: float

class TimesheetBusinessDay(BaseModel):
    date: datetime
    is_business_day: bool
    is_holiday: bool
    holiday_name: Optional[str] = None

class TimesheetBusinessCalendar(BaseModel):
    days: List[TimesheetBusinessDay]
    total_business_days: int
    total_holidays: int

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
    std_dev_hours_per_week: float = 0
    total_squad_hours: float = 0
    total_consulting_hours: float = 0
    total_internal_hours: float = 0
    total_hands_on_hours: float = 0
    weekly_hours: List[WeeklyHours] = []

class GroupSummary(TimesheetSummary):
    by_kind: Optional[Dict[str, TimesheetSummary]] = None
    by_week: Optional[List[WeekTimesheetSummary]] = None
    by_worker: Optional[List[NamedTimesheetSummary]] = None

class NamedTimesheetSummary(GroupSummary):
    name: str = Field(..., description="Name field for group summaries")

class TitledTimesheetSummary(GroupSummary):
    title: str = Field(..., description="Title field for case summaries")
    case_details: Optional[Dict[str, Any]] = None
    workers: Optional[List[str]] = None
    workers_by_tracking_project: Optional[List[Dict[str, Any]]] = None

class DateTimesheetSummary(GroupSummary):
    date: datetime = Field(..., description="Date field for date summaries")

class WeekTimesheetSummary(GroupSummary):
    week: str = Field(..., description="Week field for week summaries")

class TimesheetAppointment(BaseModel):
    date: datetime
    time_in_hs: float
    consultant_or_engineer_slug: str = Field(..., alias="worker_slug")
    client_id: int
    case_id: str
    project_id: str
    products_or_services: str
    kind: str
    sponsor: str
    account_manager_slug: str
    week: str
    comment: Optional[str] = None
    
class TimesheetByKind(BaseModel):
    consulting: TimesheetSummary
    hands_on: TimesheetSummary
    squad: TimesheetSummary
    internal: TimesheetSummary
    
class Timesheet(BaseModel):
    slug: str = Id(description="The URL-friendly identifier of the timesheet")
    summary: Optional[TimesheetSummary] = None
    business_calendar: Optional[TimesheetBusinessCalendar] = None
    by_kind: Optional[TimesheetByKind] = None
    by_worker: Optional[List[NamedTimesheetSummary]] = None
    by_client: Optional[List[NamedTimesheetSummary]] = None
    by_case: Optional[List[TitledTimesheetSummary]] = None
    by_sponsor: Optional[List[NamedTimesheetSummary]] = None
    by_account_manager: Optional[List[NamedTimesheetSummary]] = None
    by_date: Optional[List[DateTimesheetSummary]] = None
    by_week: Optional[List[WeekTimesheetSummary]] = None
    by_offer: Optional[List[NamedTimesheetSummary]] = None
    appointments: Optional[List[TimesheetAppointment]] = None 
    filterable_fields: Optional[List[FilterableField]] = None
