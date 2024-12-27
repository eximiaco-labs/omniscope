from omni_utils.helpers.dates import get_working_days_in_month

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
            }
            for month in range(1, 13)
        ]
    }
    