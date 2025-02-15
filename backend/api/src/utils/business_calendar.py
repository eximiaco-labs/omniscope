
import holidays
from datetime import datetime, timedelta

def resolve_business_calendar(_, info, start, end):
    return compute_business_calendar(start, end)
    
def compute_business_calendar(start, end):
    if isinstance(start, str):
        start = datetime.strptime(start, '%Y-%m-%d').date()
    if isinstance(end, str):
        end = datetime.strptime(end, '%Y-%m-%d').date()
        
    br_holidays = holidays.BR()
    
    working_days = []
    current = start
    while current <= end:
        if current not in br_holidays and current.weekday() < 5:
            working_days.append(current)
        current += timedelta(days=1)
    
    holidays_in_range = []
    current = start 
    while current <= end:
        if current in br_holidays:
            holidays_in_range.append({
                'date': current,
                'reason': br_holidays.get(current)
            })
        current += timedelta(days=1)
    
    return {
        'working_days': working_days,
        'holidays': holidays_in_range
    }
