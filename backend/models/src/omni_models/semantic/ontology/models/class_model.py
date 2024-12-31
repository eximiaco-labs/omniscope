from pydantic import BaseModel

class Class(BaseModel):
    slug: str
    name: str
    description: str