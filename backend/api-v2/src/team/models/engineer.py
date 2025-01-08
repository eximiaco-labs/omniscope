from typing import Dict, List
from pydantic import BaseModel, Field

class Engineer(BaseModel):
    id: str = Field(..., description="The unique identifier of the engineer")
    name: str = Field(..., description="The full name of the engineer")

# Mock data
engineers: Dict[str, Engineer] = {
    "5": Engineer(id="5", name="Charlie Davis"),
    "6": Engineer(id="6", name="Eve Johnson"),
}

def get_engineers() -> List[Engineer]:
    return list(engineers.values()) 