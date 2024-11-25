from datetime import datetime, date
from models.analytics.revenue_tracking import compute_revenue_tracking

def resolve_revenue_tracking(root, info, date_of_interest: str | date):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, "%Y-%m-%d").date()

    return compute_revenue_tracking(date_of_interest)