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
    
        
        by_month.append({
            "month": m,
            "goal": goal,
            "working_days": len(get_working_days_in_month(y, m)),
            "expected_consulting_fee": forecast_doi["by_kind"]["consulting"]['totals'].expected,
            "expected_squad_fee": forecast_doi["by_kind"]["squad"]['totals'].in_analysis,
            "expected_hands_on_fee": forecast_doi["by_kind"]["hands_on"]['totals'].in_analysis,
            "expected_consulting_pre_fee": forecast_doi["by_kind"]["consulting_pre"]['totals'].in_analysis,
            "actual": month_actual
        })
        
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
    
    
# def get_expected_regular_consulting_revenue(year, month):
    
#     result = 0
    
#     cases = [
#         case
#         for case in globals.omni_models.cases.get_all().values()
#         if case.is_active
#     ]
    
#     for case in cases:
#         wah = case.weekly_approved_hours
        
#         if not wah:
#             continue

#         project_ = None
#         for project_info in case.tracker_info:
#             if project_info.kind == 'consulting' and project_info.rate and project_info.rate.rate:
#                 project_ = project_info
#                 break
        
#         if not project_:
#             continue
        
#         working_days_in_month = get_working_days_in_month(year, month)
#         days_in_month = calendar.monthrange(year, month)[1]
        
#         hours_in_month = 0
#         daily_approved_hours = wah / 5
                
#         due_on = project_.due_on.date() if project_ and project_.due_on else case.end_of_contract
                
#         for day in range(1, days_in_month + 1):
#             date = datetime(year, month, day)
                    
#             if case.start_of_contract and date.date() < case.start_of_contract:
#                 continue
                    
#             if due_on and date.date() > due_on:
#                 break
                    
#             if date in working_days_in_month:
#                 hours_in_month += daily_approved_hours
    
#         result += hours_in_month * (project_.rate.rate / 100)
        
#     return result

# def get_expected_pre_contracted_revenue(year, month):
    
#     cases = [
#         case
#         for case in globals.omni_models.cases.get_all().values()
#         if case.is_active
#     ]
    
#     consulting_pre = 0
#     hands_on = 0
#     squad = 0
    
#     for case in cases:
#         start = case.start_of_contract # .replace(day=1)
#         if start is None:
#             start = datetime(year, month, 1)
#         else:
#             start = start.replace(day=1)
            
#         end = case.end_of_contract
#         if end is None:
#             end = datetime(year, month, calendar.monthrange(year, month)[1])
        
#         in_contract = start.year <= year <= end.year
#         if in_contract and year == start.year:
#             in_contract = month >= start.month

#         if in_contract and year == end.year:
#             in_contract = month <= end.month
            
#         if not in_contract:
#             continue
        
#         for project_info in case.tracker_info:
#             if project_info.billing and project_info.billing.fee and project_info.billing.fee != 0:
#                 if project_info.budget and project_info.budget.period == 'general':
#                     if start.year == end.year:
#                         number_of_months = end.month - start.month + 1
#                     else:
#                         months_on_start_year = 12 - start.month + 1
#                         months_on_end_year = end.month
#                         if end.year - start.year > 1:
#                             number_of_months = months_on_start_year + months_on_end_year + (end.year - start.year - 1) * 12
#                         else:   
#                             number_of_months = months_on_start_year + months_on_end_year
                            
#                     fee = project_info.billing.fee / 100 / number_of_months
                    
#                     if project_info.kind == 'consulting':
#                         consulting_pre += fee 
#                     elif project_info.kind == 'squad':
#                         squad += fee
#                     else: # hands_on
#                         hands_on += fee
                        
#                 else:
#                     fee = project_info.billing.fee / 100
#                     date_of_interest = datetime(year, month, 5)
                                    
#                     if project_info.created_at > date_of_interest:
#                         fee = 0
                    
#                     if project_info.due_on and (project_info.due_on.date() if hasattr(project_info.due_on, 'date') else project_info.due_on) < (date_of_interest.date() if hasattr(date_of_interest, 'date') else date_of_interest):
#                         fee = 0

#                     if project_info.kind == 'consulting':
#                         consulting_pre += fee
#                     elif project_info.kind == 'squad':
#                         squad += fee
#                     else: # hands_on
#                         hands_on += fee
                        
    
#     return {
#         "consulting_pre": consulting_pre,
#         "hands_on": hands_on,
#         "squad": squad
#     }
    
