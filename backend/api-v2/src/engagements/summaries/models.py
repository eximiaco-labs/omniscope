from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from omni_models.analytics.timeliness_models import TimelinessReview as TimelinessReviewModel
from omni_models.analytics.timeliness_models import WorkerSummary as WorkerSummaryModel
from core.generator import FilterableField

class TimelinessWorkerSummary(BaseModel):
    consultant_or_engineer_slug: Optional[str] = Field(..., alias="worker_slug")
    entries: int
    time_in_hours: float

    @classmethod
    def from_model(cls, model: WorkerSummaryModel) -> "TimelinessWorkerSummary":
        return cls(
            consultant_or_engineer_slug=model.worker_slug,
            entries=model.entries,
            time_in_hours=model.time_in_hours
        )

class Timeliness(BaseModel):
    total_rows: int
    total_time_in_hours: float
    
    early_rows: int
    early_time_in_hours: float
    early_percentage: float
    early_workers: List[TimelinessWorkerSummary]
    
    ok_rows: int
    ok_time_in_hours: float
    ok_percentage: float
    ok_workers: List[TimelinessWorkerSummary]
    
    acceptable_rows: int
    acceptable_time_in_hours: float
    acceptable_percentage: float
    acceptable_workers: List[TimelinessWorkerSummary]
    
    late_rows: int
    late_time_in_hours: float
    late_percentage: float
    late_workers: List[TimelinessWorkerSummary]
    
    min_date: datetime
    max_date: datetime
    filterable_fields: Optional[List[FilterableField]] = None

    @classmethod
    def from_model(cls, model: TimelinessReviewModel) -> "Timeliness":
        return cls(
            total_rows=model.total_rows,
            total_time_in_hours=model.total_time_in_hours,
            early_rows=model.early_rows,
            early_time_in_hours=model.early_time_in_hours,
            early_percentage=model.early_percentage,
            early_workers=[TimelinessWorkerSummary.from_model(w) for w in model.early_workers],
            ok_rows=model.ok_rows,
            ok_time_in_hours=model.ok_time_in_hours,
            ok_percentage=model.ok_percentage,
            ok_workers=[TimelinessWorkerSummary.from_model(w) for w in model.ok_workers],
            acceptable_rows=model.acceptable_rows,
            acceptable_time_in_hours=model.acceptable_time_in_hours,
            acceptable_percentage=model.acceptable_percentage,
            acceptable_workers=[TimelinessWorkerSummary.from_model(w) for w in model.acceptable_workers],
            late_rows=model.late_rows,
            late_time_in_hours=model.late_time_in_hours,
            late_percentage=model.late_percentage,
            late_workers=[TimelinessWorkerSummary.from_model(w) for w in model.late_workers],
            min_date=model.min_date,
            max_date=model.max_date,
            filterable_fields=model.filterable_fields
        )
