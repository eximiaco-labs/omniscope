from typing import Dict, List
from pydantic import BaseModel, Field
from core.fields import Id

class Consultant(BaseModel):
    id: str = Id(description="The unique identifier of the consultant")
    slug: str = Id(description="URL-friendly identifier of the consultant")
    name: str = Field(..., description="The full name of the consultant")

# Mock data
consultants: Dict[str, Consultant] = {
    "3": Consultant(id="3", slug="bob-wilson", name="Bob Wilson"),
    "4": Consultant(id="4", slug="alice-brown", name="Alice Brown"),
}

def get_consultants() -> List[Consultant]:
    return list(consultants.values())

def get_consultant_by_id(id: str) -> Consultant | None:
    return consultants.get(id)

def get_consultant_by_slug(slug: str) -> Consultant | None:
    return next(
        (consultant for consultant in consultants.values() if consultant.slug == slug),
        None
    ) 