from pydantic import BaseModel

class WeeklyHours(BaseModel):
    week: str
    hours: float 