from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class BusinessDay(BaseModel):
    date: datetime
    is_business_day: bool
    is_holiday: bool
    holiday_name: Optional[str] = None

class BusinessCalendar(BaseModel):
    days: List[BusinessDay]
    total_business_days: int
    total_holidays: int 