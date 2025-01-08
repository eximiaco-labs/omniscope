from typing import Dict, List
from pydantic import BaseModel, Field
from .fields import Id

class Engineer(BaseModel):
    id: str = Id(description="The unique identifier of the engineer")
    slug: str = Id(description="URL-friendly identifier of the engineer")
    name: str = Field(..., description="The full name of the engineer")

# Mock data
engineers: Dict[str, Engineer] = {
    "5": Engineer(id="5", slug="charlie-davis", name="Charlie Davis"),
    "6": Engineer(id="6", slug="eve-johnson", name="Eve Johnson"),
}

def get_engineers() -> List[Engineer]:
    return list(engineers.values())

def get_engineer_by_id(id: str) -> Engineer | None:
    return engineers.get(id)

def get_engineer_by_slug(slug: str) -> Engineer | None:
    return next(
        (engineer for engineer in engineers.values() if engineer.slug == slug),
        None
    ) 