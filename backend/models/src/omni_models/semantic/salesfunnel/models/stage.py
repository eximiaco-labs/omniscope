from pydantic import BaseModel

class Stage(BaseModel):
    id: int
    name: str
    order_nr: int 