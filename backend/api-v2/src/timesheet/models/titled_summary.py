from typing import Dict, Any, List, Optional
from pydantic import Field

from .group_summary import GroupSummary

class TitledTimesheetSummary(GroupSummary):
    title: str = Field(..., description="Title field for case summaries")
    case_details: Optional[Dict[str, Any]] = None
    workers: Optional[List[str]] = None
    workers_by_tracking_project: Optional[List[Dict[str, Any]]] = None 