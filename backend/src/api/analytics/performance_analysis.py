from datetime import datetime
import models.analytics.performance_analysis
from models.analytics.performance_analysis import PerformanceAnalysis

def resolve_performance_analysis(_, info, date_of_interest: str | datetime):
    return models.analytics.performance_analysis.compute_performance_analysis(date_of_interest)

def resolve_performance_analysis_pivoted(performance_analysis: PerformanceAnalysis, info):
    # Get unique account manager names across all weeks
    account_managers_names = sorted({
        am.name for week in performance_analysis.weeks 
        for am in week.account_managers
    })
    
    # Build mapping of account managers to their clients
    client_names_by_account_manager = {}
    for week in performance_analysis.weeks:
        for am in week.account_managers:
            if am.name not in client_names_by_account_manager:
                client_names_by_account_manager[am.name] = set()
            client_names_by_account_manager[am.name].update(
                client.name for client in am.clients
            )
    
    # Sort client names for each account manager
    client_names_by_account_manager = {
        am: sorted(clients) 
        for am, clients in client_names_by_account_manager.items()
    }
    
    by_account_manager = []
    for am_name in account_managers_names:
        # Initialize client entries
        clients = [
            {
                "name": client_name,
                "weeks": []
            }
            for client_name in client_names_by_account_manager[am_name]
        ]
        
        # Collect weekly data
        weekly_totals = []
        for week in performance_analysis.weeks:
            for am in week.account_managers:
                if am.name != am_name:
                    continue
                    
                weekly_totals.append({
                    "start": week.start,
                    "end": week.end,
                    "period_type": week.period_type,
                    "totals": am.totals.regular,
                })
                
                # Add client weekly data
                for client in am.clients:
                    if not client.totals.regular:
                        continue
                        
                    matching_client = next(
                        (c for c in clients if c["name"] == client.name),
                        None
                    )
                    if matching_client:
                        matching_client["weeks"].append({
                            "start": week.start,
                            "end": week.end,
                            "period_type": week.period_type,
                            "totals": client.totals.regular,
                        })

        # Filter out clients with no data
        clients = [client for client in clients if client["weeks"]]

        # Get past data for account manager
        past = next(
            (am.totals.regular 
             for am in performance_analysis.past.account_managers 
             if am.name == am_name),
            None
        )
            
        by_account_manager.append({
            "name": am_name,
            "by_client": clients,
            "weeks": weekly_totals,
            "past": past,
        })

    return {
        "regular": {
            "by_account_manager": by_account_manager
        }
    }

