from datetime import datetime
import models.analytics.performance_analysis

def resolve_performance_analysis(_, info, date_of_interest: str | datetime):
    return models.analytics.performance_analysis.compute_performance_analysis(date_of_interest)