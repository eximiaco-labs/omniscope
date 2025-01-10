from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from .summary import TimesheetSummary

class GroupSummary(TimesheetSummary):
    by_kind: Optional[Dict[str, TimesheetSummary]] = None
    by_week: Optional[List["WeekTimesheetSummary"]] = Field(None, description="List of week summaries")
    by_worker: Optional[List["NamedTimesheetSummary"]] = Field(None, description="List of worker summaries")

    class Config:
        arbitrary_types_allowed = True 