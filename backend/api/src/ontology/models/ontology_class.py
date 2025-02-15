from pydantic import BaseModel, Field
from core.fields import Id
class Class(BaseModel):
    id: str = Id(description="The unique identifier of the ontology class")
    slug: str = Id(description="The URL-friendly identifier of the ontology class")
    name: str = Field(..., description="The name of the ontology class")
    description: str = Field(..., description="The description of the ontology class")
