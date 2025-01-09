from pydantic import BaseModel, Field

class Class(BaseModel):
    id: str = Field(..., json_schema_extra={"is_identifier": True})
    name: str
    
