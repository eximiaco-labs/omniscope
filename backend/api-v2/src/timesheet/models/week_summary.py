from pydantic import Field

from .group_summary import GroupSummary

class WeekTimesheetSummary(GroupSummary):
    week: str = Field(..., description="Week field for week summaries") 