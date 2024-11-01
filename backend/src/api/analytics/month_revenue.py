from datetime import datetime
import models.analytics.revenue_projection

def resolve_month_revenue(_, info, date_of_interest: str | datetime):
    return models.analytics.revenue_projection.compute_revenue_projection(date_of_interest)