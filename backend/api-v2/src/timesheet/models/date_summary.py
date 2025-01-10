from datetime import datetime
from pydantic import Field

from .group_summary import GroupSummary

class DateTimesheetSummary(GroupSummary):
    date: datetime = Field(..., description="Date field for date summaries") 