from typing import Dict, List
from pydantic import BaseModel, Field

class Consultant(BaseModel):
    id: str = Field(..., description="The unique identifier of the consultant")
    name: str = Field(..., description="The full name of the consultant")

# Mock data
consultants: Dict[str, Consultant] = {
    "3": Consultant(id="3", name="Bob Wilson"),
    "4": Consultant(id="4", name="Alice Brown"),
}

def get_consultants() -> List[Consultant]:
    return list(consultants.values()) 