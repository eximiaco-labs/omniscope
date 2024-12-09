from omni_models.analytics.forecast import compute_forecast

def resolve_forecast(_, info, date_of_interest = None, filters = None):
    return compute_forecast(date_of_interest, filters)
