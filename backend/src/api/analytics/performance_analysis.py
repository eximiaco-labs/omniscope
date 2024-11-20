from datetime import datetime
import models.analytics.performance_analysis
from models.analytics.performance_analysis import PerformanceAnalysis

def resolve_performance_analysis(_, info, date_of_interest: str | datetime):
    return models.analytics.performance_analysis.compute_performance_analysis(date_of_interest)

def resolve_performance_analysis_pivoted(performance_analysis: PerformanceAnalysis, info):
    # Get unique account manager names across all weeks
    account_managers_names = sorted({
        account_manager.name
        for week in performance_analysis.weeks
        for account_manager in week.account_managers
    })
    
    # Create lookup dict for faster access
    by_account_manager = []
    for account_manager_name in account_managers_names:
        # Get weekly totals for this account manager
        weekly_totals = []
        for week in performance_analysis.weeks:
            for am in week.account_managers:
                if am.name == account_manager_name:
                    weekly_totals.append({
                        "start": week.start,
                        "end": week.end,
                        "period_type": week.period_type,
                        "totals": am.totals.regular,
                    })
                    break
 
        past = None
        for am in performance_analysis.past.account_managers:
            if am.name == account_manager_name:
                past = am.totals.regular
                break
            
        by_account_manager.append({
            "name": account_manager_name,
            "weeks": weekly_totals,
            "past": past,
        })

    return {
        "regular": {
            "by_account_manager": by_account_manager
        }
    }