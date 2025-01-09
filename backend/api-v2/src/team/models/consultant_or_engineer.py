from typing import Dict, List
from pydantic import BaseModel, Field
from core.fields import Id

class ConsultantOrEngineer(BaseModel):
    id: int = Id(description="The unique identifier of the consultant or engineer")
    slug: str = Id(description="URL-friendly identifier of the consultant or engineer")
    name: str = Field(..., description="The full name of the consultant or engineer")
    email: str = Field(..., description="The email address of the consultant or engineer")
    ontology_url: str = Field(..., description="The URL of the ontology entry of the consultant or engineer")
    photo_url: str = Field(..., description="The URL of the photo of the consultant or engineer")

# Mock data
consultants_or_engineers: Dict[str, ConsultantOrEngineer] = {
    "3": ConsultantOrEngineer(
        id=3,
        slug="bob-wilson",
        name="Bob Wilson",
        email="bob.wilson@company.com",
        ontology_url="https://ontology.company.com/bob-wilson",
        photo_url="https://photos.company.com/bob-wilson.jpg"
    ),
    "4": ConsultantOrEngineer(
        id=4,
        slug="alice-brown",
        name="Alice Brown",
        email="alice.brown@company.com",
        ontology_url="https://ontology.company.com/alice-brown",
        photo_url="https://photos.company.com/alice-brown.jpg"
    )
}

def get_consultants_or_engineers() -> List[ConsultantOrEngineer]:
    return list(consultants_or_engineers.values())

def get_consultant_or_engineer_by_id(id: str) -> ConsultantOrEngineer | None:
    return consultants_or_engineers.get(id)

def get_consultant_or_engineer_by_slug(slug: str) -> ConsultantOrEngineer | None:
    return next(
        (worker for worker in consultants_or_engineers.values() if worker.slug == slug),
        None
    ) 