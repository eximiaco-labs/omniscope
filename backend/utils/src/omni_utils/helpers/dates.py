from datetime import datetime
import calendar
import pandas as pd

def get_same_day_one_month_ago(date_of_interest):
    d = date_of_interest.day
    if date_of_interest.month == 1:
        y = date_of_interest.year - 1
        m = 12
    else:
        y = date_of_interest.year
        m = date_of_interest.month - 1

    last_day = calendar.monthrange(y, m)[1]
    if d > last_day:
        d = last_day

    return datetime(y, m, d, 23, 59, 59, 999999)

def get_same_day_one_month_later(date_of_interest):
    d = date_of_interest.day
    m = date_of_interest.month + 1
    y = date_of_interest.year
    if m > 12:
        m = 1
        y += 1
    return datetime(y, m, d, 23, 59, 59, 999999)

def get_last_day_of_month(date_of_interest):
    y = date_of_interest.year
    m = date_of_interest.month
    last_day = calendar.monthrange(y, m)[1]
    return datetime(y, m, last_day, 23, 59, 59, 999999)

def get_working_days_in_month(year, month):
    import holidays
    
    # Get all days in month
    num_days = calendar.monthrange(year, month)[1]
    
    # Get Brazil holidays
    br_holidays = holidays.BR(years=year)
    
    # Create list of all dates in month
    working_days = []
    for day in range(1, num_days + 1):
        date = datetime(year, month, day)
        # Check if weekday (0=Monday, 6=Sunday) and not a holiday
        if date.weekday() < 5 and date.date() not in br_holidays:  # 0-4 are weekdays
            working_days.append(date)
            
    return working_days