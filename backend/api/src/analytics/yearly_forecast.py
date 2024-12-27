from omni_utils.helpers.dates import get_working_days_in_month
import calendar
from datetime import datetime

from omni_shared import globals

def resolve_yearly_forecast(_, info, year=None):
    if year is None:
        year = 2025
    
    main_goal = 30000000
    
    by_month = []
    for month in range(1, 13):
        expected_consulting_fee = get_expected_regular_consulting_revenue(year, month)
        expected_pre_contracted_revenue = get_expected_pre_contracted_revenue(year, month)
        
        by_month.append({
            "month": month,
            "goal": main_goal / 12,
            "working_days": len(get_working_days_in_month(year, month)),
            "expected_consulting_fee": expected_consulting_fee,
            "expected_squad_fee": expected_pre_contracted_revenue["squad"],
            "expected_hands_on_fee": expected_pre_contracted_revenue["hands_on"],
            "expected_consulting_pre_fee": expected_pre_contracted_revenue["consulting_pre"]
        })
        
    return { 
        "year": year,
        "goal": main_goal,
        "by_month": by_month
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
        
        if not wah:
            continue

        project_ = None
        for project_info in case.tracker_info:
            if project_info.kind == 'consulting' and project_info.rate and project_info.rate.rate:
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

def get_expected_pre_contracted_revenue(year, month):
    
    cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    consulting_pre = 0
    hands_on = 0
    squad = 0
    
    for case in cases:
        start = case.start_of_contract # .replace(day=1)
        if start is None:
            start = datetime(year, month, 1)
        else:
            start = start.replace(day=1)
            
        end = case.end_of_contract
        if end is None:
            end = datetime(year, month, calendar.monthrange(year, month)[1])
        
        in_contract = start.year <= year <= end.year
        if in_contract and year == start.year:
            in_contract = month >= start.month

        if in_contract and year == end.year:
            in_contract = month <= end.month
            
        if not in_contract:
            continue
        
        for project_info in case.tracker_info:
            if project_info.billing and project_info.billing.fee and project_info.billing.fee != 0:
                if project_info.budget and project_info.budget.period == 'general':
                    if start.year == end.year:
                        number_of_months = end.month - start.month + 1
                    else:
                        months_on_start_year = 12 - start.month + 1
                        months_on_end_year = end.month
                        if end.year - start.year > 1:
                            number_of_months = months_on_start_year + months_on_end_year + (end.year - start.year - 1) * 12
                        else:   
                            number_of_months = months_on_start_year + months_on_end_year
                            
                    fee = project_info.billing.fee / 100 / number_of_months
                    
                    if project_info.kind == 'consulting':
                        consulting_pre += fee 
                    elif project_info.kind == 'squad':
                        squad += fee
                    else: # hands_on
                        hands_on += fee
                        
                else:
                    fee = project_info.billing.fee / 100
                    if project_info.kind == 'consulting':
                        consulting_pre += fee
                    elif project_info.kind == 'squad':
                        squad += fee
                    else: # hands_on
                        hands_on += fee
                        
                # else:
                #     fee = project_info.billing.fee / 100
                #     if project_info.kind == 'consulting':
                #         consulting_pre += fee
                #     elif project_info.kind == 'hands_on':
                #         hands_on += fee
                #     elif project_info.kind == 'squad':
                #         squad += fee
    
    return {
        "consulting_pre": consulting_pre,
        "hands_on": hands_on,
        "squad": squad
    }
    
