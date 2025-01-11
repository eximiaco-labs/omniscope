from typing import Dict, List, Optional
from pydantic import BaseModel

from core.fields import Id

from .summary import TimesheetSummary
from .business_calendar import BusinessCalendar
from .named_summary import NamedTimesheetSummary
from .titled_summary import TitledTimesheetSummary
from .date_summary import DateTimesheetSummary
from .week_summary import WeekTimesheetSummary
from .appointment import TimesheetAppointment

class Timesheet(BaseModel):
    slug: str = Id(description="The URL-friendly identifier of the timesheet")
    summary: Optional[TimesheetSummary] = None
    business_calendar: Optional[BusinessCalendar] = None
    by_kind: Optional[Dict[str, TimesheetSummary]] = None
    by_worker: Optional[List[NamedTimesheetSummary]] = None
    by_client: Optional[List[NamedTimesheetSummary]] = None
    by_case: Optional[List[TitledTimesheetSummary]] = None
    by_sponsor: Optional[List[NamedTimesheetSummary]] = None
    by_account_manager: Optional[List[NamedTimesheetSummary]] = None
    by_date: Optional[List[DateTimesheetSummary]] = None
    by_week: Optional[List[WeekTimesheetSummary]] = None
    by_offer: Optional[List[NamedTimesheetSummary]] = None
    appointments: Optional[List[TimesheetAppointment]] = None 