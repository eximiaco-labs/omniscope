from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from core.generator import FilterableField
from core.decorators import namespace
from omni_models.analytics.revenue_tracking import RevenueTracking, compute_revenue_tracking
from omni_models.analytics.forecast import RevenueForecast, compute_forecast

@namespace
class Financial(BaseModel):
    def revenue_tracking(self, date_of_interest: date = None, filters: Optional[List[FilterableField]] = None) -> RevenueTracking:
        return compute_revenue_tracking(date_of_interest, filters)
    
    def revenue_forecast(self, date_of_interest: date = None, filters: Optional[List[FilterableField]] = None) -> RevenueForecast:           
        return compute_forecast(date_of_interest, filters)