from omni_utils.helpers.dates import get_working_days_in_month
import calendar
from datetime import datetime

from omni_shared import globals

def resolve_yearly_forecast(_, info, year=None):
    if year is None:
        year = 2025
    
    main_goal = 30000000
    return { 
        "year": year,
        "goal": main_goal,
        "by_month": [
            {
                "month": month,
                "goal": main_goal / 12,
                "working_days": len(get_working_days_in_month(year, month)),
                "expected_consulting_fee": get_expected_regular_consulting_revenue(year, month)
            }
            for month in range(1, 13)
        ]
    }
    
    
def get_expected_regular_consulting_revenue(year, month):
    
    result = 0
    
    cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    for case in cases:
        wah = case.weekly_approved_hours
        
        if not wah or case.pre_contracted_value:
            continue
        
        project_ = None
        for project_info in case.tracker_info:
            if project_info.kind == 'consulting' and project_info.rate:
                project_ = project_info
                break
        
        if not project_:
            continue
        
        working_days_in_month = get_working_days_in_month(year, month)
        days_in_month = calendar.monthrange(year, month)[1]
        
        hours_in_month = 0
        daily_approved_hours = wah / 5
                
        due_on = project_.due_on.date() if project_ and project_.due_on else case.end_of_contract
                
        for day in range(1, days_in_month + 1):
            date = datetime(year, month, day)
                    
            if case.start_of_contract and date.date() < case.start_of_contract:
                continue
                    
            if due_on and date.date() > due_on:
                break
                    
            if date in working_days_in_month:
                hours_in_month += daily_approved_hours
    
        result += hours_in_month * (project_.rate.rate / 100)
        
    return result
