from typing import Optional
from pydantic import BaseModel

class Billing(BaseModel):
    type: Optional[str] = None
    fee: Optional[float] = None
    
class Rate(BaseModel):
    type: Optional[str] = None
    rate: Optional[float] = None 