from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from core.fields import Id
from timesheet.models import Timesheet
from engagements.summaries.models import Staleliness
class ConsultantOrEngineer(BaseModel):
    id: int = Id(description="The unique identifier of the consultant or engineer")
    slug: str = Id(description="URL-friendly identifier of the consultant or engineer")
    name: str = Field(..., description="The full name of the consultant or engineer")
    email: str = Field(..., description="The email address of the consultant or engineer")
    ontology_url: str = Field(..., description="The URL of the ontology entry of the consultant or engineer")
    photo_url: str = Field(..., description="The URL of the photo of the consultant or engineer")
    errors: List[str] = Field(..., description="The errors of the consultant or engineer")
    position: str = Field(..., description="The position of the consultant or engineer")
    is_recognized: bool = Field(..., description="Whether the consultant or engineer is recognized")
    is_ontology_author: bool = Field(..., description="Whether the consultant or engineer is an ontology author")
    is_insights_author: bool = Field(..., description="Whether the consultant or engineer is an insights author")
    is_time_tracker_worker: bool = Field(..., description="Whether the consultant or engineer is a time tracker worker")
    is_special_projects_worker: bool = Field(..., description="Whether the consultant or engineer is a special projects worker")
    
    timesheet: Optional[Timesheet] = None
    staleliness : Optional[Staleliness] = None
    
    @classmethod
    def from_domain(cls, worker):
        """Convert a Worker instance to an AccountManager instance"""
        if worker is None:
            return None
        
        return ConsultantOrEngineer(
            id=worker.id,
            slug=worker.slug,
            name=worker.name,
            email=worker.email or "",
            ontology_url=str(worker.ontology_url or ""),
            photo_url=str(worker.photo_url or ""),
            is_recognized=worker.is_recognized,
            position=worker.position,
            errors=worker.errors,
            is_ontology_author=worker.is_ontology_author,
            is_insights_author=worker.is_insights_author,
            is_time_tracker_worker=worker.is_time_tracker_worker,
            is_special_projects_worker=worker.is_special_projects_worker
        )
 
