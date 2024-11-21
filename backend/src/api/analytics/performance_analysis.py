from datetime import datetime
import models.analytics.performance_analysis
from models.analytics.performance_analysis import PerformanceAnalysis, TotalsRegular

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
    
    # Build mapping of clients to their sponsors
    sponsor_names_by_client = {}
    for week in performance_analysis.weeks:
        for am in week.account_managers:
            for client in am.clients:
                if client.name not in sponsor_names_by_client:
                    sponsor_names_by_client[client.name] = set()
                sponsor_names_by_client[client.name].update(
                    sponsor.name for sponsor in client.sponsors
                )
    
    # Sort sponsor names for each client
    sponsor_names_by_client = {
        client: sorted(sponsors)
        for client, sponsors in sponsor_names_by_client.items()
    }

    # Build mapping of sponsors to their cases
    case_titles_by_sponsor = {}
    for week in performance_analysis.weeks:
        for am in week.account_managers:
            for client in am.clients:
                for sponsor in client.sponsors:
                    if sponsor.name not in case_titles_by_sponsor:
                        case_titles_by_sponsor[sponsor.name] = set()
                    case_titles_by_sponsor[sponsor.name].update(
                        case.title for case in sponsor.regular_cases
                    )

    # Sort case titles for each sponsor
    case_titles_by_sponsor = {
        sponsor: sorted(cases)
        for sponsor, cases in case_titles_by_sponsor.items()
    }
    
    by_account_manager = []
    for am_name in account_managers_names:
        # Initialize client entries
        clients = []
        for client_name in client_names_by_account_manager[am_name]:
            # Initialize sponsor entries for this client
            sponsors = []
            for sponsor_name in sponsor_names_by_client.get(client_name, []):
                # Initialize case entries for this sponsor
                cases = [
                    {
                        "title": case_title,
                        "weeks": []
                    }
                    for case_title in case_titles_by_sponsor.get(sponsor_name, [])
                ]
                
                sponsors.append({
                    "name": sponsor_name,
                    "weeks": [],
                    "by_case": cases
                })
            
            clients.append({
                "name": client_name,
                "weeks": [],
                "by_sponsor": sponsors
            })
        
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
                
                # Add client and sponsor weekly data
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
                        
                        # Add sponsor weekly data
                        for sponsor in client.sponsors:
                            if not sponsor.totals.regular:
                                continue
                                
                            matching_sponsor = next(
                                (s for s in matching_client["by_sponsor"] if s["name"] == sponsor.name),
                                None
                            )
                            if matching_sponsor:
                                matching_sponsor["weeks"].append({
                                    "start": week.start,
                                    "end": week.end,
                                    "period_type": week.period_type,
                                    "totals": sponsor.totals.regular,
                                })

                                # Add case weekly data
                                for case in sponsor.regular_cases:
                                    matching_case = next(
                                        (c for c in matching_sponsor["by_case"] if c["title"] == case.title),
                                        None
                                    )
                                    if matching_case:
                                        matching_case["weeks"].append({
                                            "start": week.start,
                                            "end": week.end,
                                            "period_type": week.period_type,
                                            "totals": TotalsRegular(
                                                approved_work_hours=case.approved_work_hours,
                                                actual_work_hours=case.actual_work_hours,
                                                in_context_actual_work_hours=case.in_context_actual_work_hours,
                                                wasted_hours=case.wasted_hours,
                                                over_approved_hours=case.over_approved_hours
                                            ),
                                            "actual_work_hours": case.actual_work_hours,
                                            "in_context_actual_work_hours": case.in_context_actual_work_hours,
                                            "wasted_hours": case.wasted_hours,
                                            "over_approved_hours": case.over_approved_hours
                                        })

        # Filter out cases with no data
        for client in clients:
            for sponsor in client["by_sponsor"]:
                sponsor["by_case"] = [case for case in sponsor["by_case"] if case["weeks"]]

        # Filter out sponsors with no data and no cases
        for client in clients:
            client["by_sponsor"] = [sponsor for sponsor in client["by_sponsor"] if sponsor["weeks"] or sponsor["by_case"]]
            
        # Filter out clients with no data and no sponsors
        clients = [client for client in clients if client["weeks"] or client["by_sponsor"]]

        # Get past data for account manager
        past_am = next(
            (am
             for am in performance_analysis.past.account_managers 
             if am.name == am_name),
            None
        )
        
        # Add past data for each account manager's client and their sponsors
        for client in clients:
            for past_client in past_am.clients:
                if past_client.name == client["name"]:
                    client["past"] = past_client.totals.regular
                    
                    # Add past data for sponsors and their cases
                    for sponsor in client["by_sponsor"]:
                        for past_sponsor in past_client.sponsors:
                            if past_sponsor.name == sponsor["name"]:
                                sponsor["past"] = past_sponsor.totals.regular
                                
                                # Add past data for cases
                                for case in sponsor["by_case"]:
                                    past_case = next(
                                        (c for c in past_sponsor.regular_cases if c.title == case["title"]),
                                        None
                                    )
                                    if past_case:
                                        case["past"] = TotalsRegular(
                                            approved_work_hours=past_case.approved_work_hours,
                                            actual_work_hours=past_case.actual_work_hours,
                                            in_context_actual_work_hours=past_case.in_context_actual_work_hours,
                                            wasted_hours=past_case.wasted_hours,
                                            over_approved_hours=past_case.over_approved_hours
                                        )
                                break
                    break
            
        by_account_manager.append({
            "name": am_name,
            "by_client": clients,
            "weeks": weekly_totals,
            "past": past_am.totals.regular,
        })

    return {
        "regular": {
            "by_account_manager": by_account_manager
        }
    }
