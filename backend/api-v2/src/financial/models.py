from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from core.generator import FilterableField
from core.decorators import namespace
from omni_models.analytics.revenue_tracking import RevenueTracking, compute_revenue_tracking

@namespace
class Financial(BaseModel):
    def revenue_tracking(self, date_of_interest: date = None, filters: Optional[List[FilterableField]] = None) -> RevenueTracking:
        
        if not date_of_interest:
            date_of_interest = date.today()
            
        if isinstance(date_of_interest, str):
            date_of_interest = date.fromisoformat(date_of_interest)
        return compute_revenue_tracking(date_of_interest, filters)
