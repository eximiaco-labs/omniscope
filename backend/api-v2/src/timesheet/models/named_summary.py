from pydantic import Field

from .group_summary import GroupSummary

class NamedTimesheetSummary(GroupSummary):
    name: str = Field(..., description="Name field for group summaries") 