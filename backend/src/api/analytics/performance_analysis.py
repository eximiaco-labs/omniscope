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
    
    # Get unique client names for each account manager across all weeks
    client_names_by_account_manager = {}
    for week in performance_analysis.weeks:
        for account_manager in week.account_managers:
            if account_manager.name not in client_names_by_account_manager:
                client_names_by_account_manager[account_manager.name] = set()
            
            # Add all client names from this week's clients
            client_names_by_account_manager[account_manager.name].update(
                client.name for client in account_manager.clients
            )
    
    # Convert sets to sorted lists
    for account_manager_name in client_names_by_account_manager:
        client_names_by_account_manager[account_manager_name] = sorted(
            client_names_by_account_manager[account_manager_name]
        )
    
    
    by_account_manager = []
    for account_manager_name in account_managers_names:
        clients = [
            { 
                "name": client_name,
                "weeks": []
            }
            for client_name in client_names_by_account_manager[account_manager_name]
        ]
        
        weekly_totals = []
        for week in performance_analysis.weeks:
            for am in week.account_managers:
                weekly_totals.append({
                    "start": week.start,
                    "end": week.end,
                    "period_type": week.period_type,
                    "totals": am.totals.regular,
                })
                    
                for client in am.clients:
                    if client.totals.regular is not None:
                        for client_entry in clients:
                            if client_entry["name"] == client.name:
                                client_entry["weeks"].append({
                                    "start": week.start,
                                    "end": week.end,
                                    "period_type": week.period_type,
                                    "totals": client.totals.regular,
                                })
                                break

        clients = [
            client
            for client in clients
            if len(client["weeks"]) > 0
        ]

        past = None
        for am in performance_analysis.past.account_managers:
            if am.name == account_manager_name:
                past = am.totals.regular
                break
            
        by_account_manager.append({
            "name": account_manager_name,
            "by_client": clients,
            "weeks": weekly_totals,
            "past": past,
        })

    return {
        "regular": {
            "by_account_manager": by_account_manager
        }
    }    
