from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class WorkerSummary(BaseModel):
    worker: str
    worker_slug: Optional[str] = None
    entries: int
    time_in_hours: float

class TimelinessReview(BaseModel):
    total_rows: int
    total_time_in_hours: float
    
    early_rows: int
    early_time_in_hours: float
    early_percentage: float
    early_workers: List[WorkerSummary]
    
    ok_rows: int
    ok_time_in_hours: float
    ok_percentage: float
    ok_workers: List[WorkerSummary]
    
    acceptable_rows: int
    acceptable_time_in_hours: float
    acceptable_percentage: float
    acceptable_workers: List[WorkerSummary]
    
    late_rows: int
    late_time_in_hours: float
    late_percentage: float
    late_workers: List[WorkerSummary]
    
    min_date: datetime
    max_date: datetime
    filterable_fields: dict 