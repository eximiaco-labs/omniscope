from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from core.generator import FilterableField
from core.decorators import namespace
from omni_models.analytics.revenue_tracking import RevenueTracking, compute_revenue_tracking
from omni_models.analytics.forecast import RevenueForecast, compute_forecast

from omni_utils.helpers.dates import get_working_days_in_month
from omni_utils.helpers.dates import get_last_day_of_month

from datetime import datetime


class YearlyRevenueForecastByMonth(BaseModel):
    month: int
    goal: float
    working_days: int
    expected_consulting_fee: float
    expected_squad_fee: float
    expected_hands_on_fee: float
    expected_consulting_pre_fee: float
    actual: float
    actual_consulting_fee: float
    actual_squad_fee: float
    actual_hands_on_fee: float
    actual_consulting_pre_fee: float


class YearlyRevenueForecast(BaseModel):
    year: int
    goal: float
    by_month: List[YearlyRevenueForecastByMonth]
    working_days: int
    realized_working_days: int


@namespace
class Financial(BaseModel):
    def revenue_tracking(self, date_of_interest: date = None, filters: Optional[List[FilterableField]] = None) -> RevenueTracking:
        return compute_revenue_tracking(date_of_interest, filters)
    
    def revenue_forecast(self, date_of_interest: date = None, filters: Optional[List[FilterableField]] = None) -> RevenueForecast:           
        return compute_forecast(date_of_interest, filters)
    
    def yearly_revenue_forecast(self, year: int = None) -> YearlyRevenueForecast:
        if year is None:
            year = 2025
        
        main_goal = 30000000
        
        actual = 0
        current_date = datetime.now()
        current_year = current_date.year
        current_month = current_date.month
        
        by_month = []
        revenue_tracking = None
        for month in range(1, 13):
            m = month - 1 if month > 1 else 12
            y = year if month > 1 else year - 1
            
            last_day_of_month = get_last_day_of_month(datetime(y, m, 1))
            date_of_interest = datetime(y, m, 15)   
            discount = main_goal / (13 - month)
            if (y == current_year and m == current_month):
                forecast = compute_forecast(current_date)
                forecast_doi = forecast
            else:
                forecast = compute_forecast(last_day_of_month)
                forecast_doi = compute_forecast(date_of_interest)
                
            goal = main_goal / (13 - month)
            month_actual = 0
            if y < current_year or (y == current_year and m < current_month):
                goal = 0
                month_actual = forecast.summary.realized
                discount = month_actual
                actual += month_actual
            elif y == current_year and m == current_month:
                month_actual = forecast.summary.realized 
                actual += month_actual
                
            if y < current_year or (y == current_year and m < current_month):
                reference = forecast
            else:
                reference = forecast_doi
        
            month_data = YearlyRevenueForecastByMonth(
                month=m,
                goal=goal,
                working_days=len(get_working_days_in_month(y, m)),
                expected_consulting_fee=reference.by_kind.consulting.totals.expected,
                expected_squad_fee=reference.by_kind.squad.totals.in_analysis,
                expected_hands_on_fee=reference.by_kind.hands_on.totals.in_analysis,
                expected_consulting_pre_fee=reference.by_kind.consulting_pre.totals.in_analysis,
                actual=month_actual,
                actual_consulting_fee=reference.by_kind.consulting.totals.in_analysis if y < current_year or (y == current_year and m <= current_month) else 0,
                actual_squad_fee=reference.by_kind.squad.totals.in_analysis if y < current_year or (y == current_year and m <= current_month) else 0,
                actual_hands_on_fee=reference.by_kind.hands_on.totals.in_analysis if y < current_year or (y == current_year and m <= current_month) else 0,
                actual_consulting_pre_fee=reference.by_kind.consulting_pre.totals.in_analysis if y < current_year or (y == current_year and m <= current_month) else 0
            )
            
            by_month.append(month_data)
            
            main_goal -= discount
            
        total_working_days = sum(len(get_working_days_in_month(y, m)) for m in range(1, 13))
        
        realized_working_days = 0
        current_date = datetime.now()
        
        for month in range(1, 13):
            y = year if month > 1 else year - 1
            m = month - 1 if month > 1 else 12
            
            if y < current_date.year or (y == current_date.year and m < current_date.month):
                realized_working_days += len(get_working_days_in_month(y, m))
            elif y == current_date.year and m == current_date.month:
                working_days = get_working_days_in_month(y, m)
                realized_working_days += sum(1 for day in working_days if day.date() <= current_date.date())
        
        return YearlyRevenueForecast(
            year=year,
            goal=30000000,
            by_month=by_month,
            working_days=total_working_days,
            realized_working_days=realized_working_days
        )