from datetime import datetime, date
from omni_models.analytics.revenue_tracking import compute_revenue_tracking

def resolve_revenue_tracking(
    root, info, 
    date_of_interest: str | date = None, 
    account_manager_name_or_slug: str = None,
    filters=None
):
    if date_of_interest is None:
        date_of_interest = datetime.now().date()
    elif isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, "%Y-%m-%d").date()

    return compute_revenue_tracking(date_of_interest, account_manager_name_or_slug, filters)