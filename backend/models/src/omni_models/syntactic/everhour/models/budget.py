from typing import Optional
from pydantic import BaseModel

class Budget(BaseModel):
    type: Optional[str]=None
    budget: Optional[int]=None
    period: Optional[str]='general'

    @property
    def hours(self) -> float:
        if self.type != "time":
            return None
        return self.budget / 60 / 60 