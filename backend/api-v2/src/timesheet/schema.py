from .models import (
    TimesheetAppointment,
    BusinessCalendar,
    DateTimesheetSummary,
    NamedTimesheetSummary,
    TitledTimesheetSummary,
    Timesheet,
    TimesheetSummary,
    WeekTimesheetSummary
)
from core.generator import generate_schema

types = [Timesheet]
schema = generate_schema(types, None, include_base_types=False)

__all__ = ['schema'] 