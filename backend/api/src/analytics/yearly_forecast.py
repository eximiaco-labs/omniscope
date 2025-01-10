from omni_utils.helpers.dates import get_working_days_in_month
from omni_models.analytics.forecast import compute_forecast
from omni_utils.helpers.dates import get_last_day_of_month

import calendar
from datetime import datetime

from omni_shared import globals

def resolve_yearly_forecast(_, info, year=None):
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
        #expected_consulting_fee = get_expected_regular_consulting_revenue(y, m)
        #expected_pre_contracted_revenue = get_expected_pre_contracted_revenue(y, m)
        
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
            
            month_actual = forecast["summary"]["realized"]
            discount = month_actual
            actual += month_actual
        elif y == current_year and m == current_month:
            month_actual = forecast["summary"]["realized"]
            # discount = month_actual
            actual += month_actual
    
    
        month = {
            "month": m,
            "goal": goal,
            "working_days": len(get_working_days_in_month(y, m)),
            "expected_consulting_fee": forecast_doi["by_kind"]["consulting"]['totals'].expected,
            "expected_squad_fee": forecast_doi["by_kind"]["squad"]['totals'].in_analysis,
            "expected_hands_on_fee": forecast_doi["by_kind"]["hands_on"]['totals'].in_analysis,
            "expected_consulting_pre_fee": forecast_doi["by_kind"]["consulting_pre"]['totals'].in_analysis,
            "actual": month_actual
        }
        
        if y < current_year or (y == current_year and m < current_month):
            month_actual = {
                "actual_consulting_fee": forecast["by_kind"]["consulting"]['totals'].in_analysis,
                "actual_squad_fee": forecast["by_kind"]["squad"]['totals'].in_analysis,
                "actual_hands_on_fee": forecast["by_kind"]["hands_on"]['totals'].in_analysis,
                "actual_consulting_pre_fee": forecast["by_kind"]["consulting_pre"]['totals'].in_analysis
            }
        elif y == current_year and m == current_month:
            month_actual = {
                "actual_consulting_fee": forecast_doi["by_kind"]["consulting"]['totals'].in_analysis,
                "actual_squad_fee": forecast_doi["by_kind"]["squad"]['totals'].in_analysis,
                "actual_hands_on_fee": forecast_doi["by_kind"]["hands_on"]['totals'].in_analysis,
                "actual_consulting_pre_fee": forecast_doi["by_kind"]["consulting_pre"]['totals'].in_analysis
            }
        else:
            month_actual = {
                "actual_consulting_fee": 0,
                "actual_squad_fee": 0,
                "actual_hands_on_fee": 0,
                "actual_consulting_pre_fee": 0
            }   
        
        by_month.append(month | month_actual)
        
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
    
    return { 
        "year": year,
        "goal": 30000000,
        "by_month": by_month,
        "working_days": total_working_days,
        "realized_working_days": realized_working_days
    }
    
