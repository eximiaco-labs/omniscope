from omni_utils.helpers.dates import get_working_days_in_month
import calendar
from datetime import datetime

from omni_shared import globals

def resolve_yearly_forecast(_, info, year=None):
    if year is None:
        year = 2025
    
    main_goal = 30000000
    
    by_month = []
    for month in range(1, 13):
        expected_consulting_fee = get_expected_regular_consulting_revenue(year, month)
        expected_pre_contracted_revenue = get_expected_pre_contracted_revenue(year, month)
        
        by_month.append({
            "month": month,
            "goal": main_goal / 12,
            "working_days": len(get_working_days_in_month(year, month)),
            "expected_consulting_fee": expected_consulting_fee,
            "expected_squad_fee": expected_pre_contracted_revenue["squad"],
            "expected_hands_on_fee": expected_pre_contracted_revenue["hands_on"],
            "expected_consulting_pre_fee": expected_pre_contracted_revenue["consulting_pre"]
        })
        
    return { 
        "year": year,
        "goal": main_goal,
        "by_month": by_month
    }
    
    
def get_expected_regular_consulting_revenue(year, month):
    
    result = 0
    
    cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    for case in cases:
        wah = case.weekly_approved_hours
        
        if not wah:
            continue

        project_ = None
        for project_info in case.tracker_info:
            if project_info.kind == 'consulting' and project_info.rate and project_info.rate.rate:
                project_ = project_info
                break
        
        if not project_:
            continue
        
        working_days_in_month = get_working_days_in_month(year, month)
        days_in_month = calendar.monthrange(year, month)[1]
        
        hours_in_month = 0
        daily_approved_hours = wah / 5
                
        due_on = project_.due_on.date() if project_ and project_.due_on else case.end_of_contract
                
        for day in range(1, days_in_month + 1):
            date = datetime(year, month, day)
                    
            if case.start_of_contract and date.date() < case.start_of_contract:
                continue
                    
            if due_on and date.date() > due_on:
                break
                    
            if date in working_days_in_month:
                hours_in_month += daily_approved_hours
    
        result += hours_in_month * (project_.rate.rate / 100)
        
    return result

def get_expected_pre_contracted_revenue(year, month):
    
    cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]
    
    consulting_pre = 0
    hands_on = 0
    squad = 0
    
    for case in cases:
        start = case.start_of_contract # .replace(day=1)
        if start is None:
            start = datetime(year, month, 1)
        else:
            start = start.replace(day=1)
            
        end = case.end_of_contract
        if end is None:
            end = datetime(year, month, calendar.monthrange(year, month)[1])
        
        in_contract = start.year <= year <= end.year
        if in_contract and year == start.year:
            in_contract = month >= start.month

        if in_contract and year == end.year:
            in_contract = month <= end.month
            
        if not in_contract:
            continue
        
        for project_info in case.tracker_info:
            if project_info.billing and project_info.billing.fee and project_info.billing.fee != 0:
                if project_info.budget and project_info.budget.period == 'general':
                    if start.year == end.year:
                        number_of_months = end.month - start.month + 1
                    else:
                        months_on_start_year = 12 - start.month + 1
                        months_on_end_year = end.month
                        if end.year - start.year > 1:
                            number_of_months = months_on_start_year + months_on_end_year + (end.year - start.year - 1) * 12
                        else:   
                            number_of_months = months_on_start_year + months_on_end_year
                            
                    fee = project_info.billing.fee / 100 / number_of_months
                    
                    if project_info.kind == 'consulting':
                        consulting_pre += fee
                    elif project_info.kind == 'hands_on':
                        hands_on += fee
                    elif project_info.kind == 'squad':
                        squad += fee
                elif case.pre_contracted_value:
                    fee = project_info.billing.fee / 100
                    if project_info.kind == 'consulting':
                        consulting_pre += fee
                    elif project_info.kind == 'hands_on':
                        hands_on += fee
                    elif project_info.kind == 'squad':
                        squad += fee
    
    return {
        "consulting_pre": consulting_pre,
        "hands_on": hands_on,
        "squad": squad
    }
    

            # else:
            #     project_df = timesheet_df[timesheet_df["ProjectId"] == project.id]
            #     if len(project_df) == 0:
            #         return None
                    
            #     partial = False
            #     fee = project.billing.fee / 100
            #     partial_fee = 0
                
            #     if project.kind != "consulting":    
            #         is_last_day_of_month = date_of_interest.month != (date_of_interest + timedelta(days=1)).month
            #         client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
            #         if not client:
            #             client_name = "N/A"
            #             account_manager_name = "N/A"
            #         else:
            #             client_name = client.name
            #             account_manager_name = client.account_manager.name if client.account_manager else "N/A"
                        
            #         if is_last_day_of_month:
                        
            #             workers_hours = project_df.groupby("WorkerName")["TimeInHs"].sum().reset_index()
            #             if len(workers_hours) == 0:
            #                 return None
                            
            #             number_of_workers = len(workers_hours)
            #             fee_per_worker = fee / number_of_workers
            #             hourly_fee = fee_per_worker / 160
                        
            #             for worker_name, hours in workers_hours.values:
            #                 if hours < 140:
            #                     partial = True
            #                     partial_fee += hourly_fee * hours
                                
            #                     kinds = pro_rata_info["by_kind"]
                                
            #                     kind_info = next(
            #                         (e for e in kinds if e["kind"] == project.kind),
            #                         None
            #                     )
                                
            #                     if kind_info is None:
            #                         kind_info = {
            #                             "kind": project.kind,
            #                             "penalty": 0,
            #                             "by_account_manager": []
            #                         }
            #                         kinds.append(kind_info)
                                    
            #                     account_managers = kind_info["by_account_manager"]
                                
            #                     # Find or create account manager info
            #                     account_manager_info = next(
            #                         (
            #                             e for e in account_managers 
            #                             if e["name"] == account_manager_name
            #                         ),
            #                         None
            #                     )
                                
            #                     if account_manager_info is None:
            #                         account_manager_info = {
            #                             "name": account_manager_name,
            #                             "penalty": 0,
            #                             "by_client": []
            #                         }
            #                         account_managers.append(account_manager_info)
                                
                                    
            #                     client_info = next(
            #                         (
            #                             e for e in account_manager_info["by_client"] 
            #                             if e["name"] == client_name
            #                         ),
            #                         None
            #                     )
                                
            #                     if client_info is None:
            #                         client_info = {
            #                             "name": client_name,
            #                             "penalty": 0,
            #                             "by_sponsor": []
            #                         }
            #                         account_manager_info["by_client"].append(client_info)
                                
            #                     sponsor_info = next(
            #                         (
            #                             e for e in client_info["by_sponsor"] 
            #                             if e["name"] == case.sponsor
            #                         ),
            #                         None
            #                     )
                                
            #                     if sponsor_info is None:
            #                         sponsor_info = {
            #                             "name": case.sponsor,
            #                             "penalty": 0,
            #                             "by_case": []
            #                         }
            #                         client_info["by_sponsor"].append(sponsor_info)
                                    
            #                     case_info = next(
            #                         (
            #                             e for e in sponsor_info["by_case"] 
            #                             if e["title"] == case.title
            #                         ),
            #                         None
            #                     )
                                
            #                     if case_info is None:
            #                         case_info = {
            #                             "title": case.title,
            #                             "penalty": 0,
            #                             "by_project": []
            #                         }
            #                         sponsor_info["by_case"].append(case_info)
                                    
            #                     project_info = next(
            #                         (
            #                             e for e in case_info["by_project"] 
            #                             if e["name"] == project.name
            #                         ),
            #                         None
            #                     )
                                
            #                     if project_info is None:
            #                         project_info = {
            #                             "name": project.name,
            #                             "partial_fee": fee,
            #                             "penalty": 0,
            #                             "by_worker": []
            #                         }
            #                         case_info["by_project"].append(project_info)
                                    
            #                     penalty = fee_per_worker - (hourly_fee * hours)
            #                     project_info["by_worker"].append({
            #                         "name": worker_name,
            #                         "hours": hours,
            #                         "partial_fee": hourly_fee * hours,
            #                         "penalty": penalty
            #                     })
                                
            #                     project_info["partial_fee"] = project_info["partial_fee"] - penalty
            #                     project_info["penalty"] = project_info["penalty"] + penalty
            #                     case_info["penalty"] = case_info["penalty"] + penalty
            #                     sponsor_info["penalty"] = sponsor_info["penalty"] + penalty
            #                     client_info["penalty"] = client_info["penalty"] + penalty
            #                     account_manager_info["penalty"] = account_manager_info["penalty"] + penalty
            #                     kind_info["penalty"] = kind_info["penalty"] + penalty  
                                
                            
            #     # TODO: Verificar se tem algum colaborador lançando horas no primeiro dia de trabalho do mês
            #     # TODO: fator individual por trabalhador   
            #     # TODO: O que fazer com "trabalhaadores ocasionais"
         
            #     result = {
            #         "kind": project.kind,
            #         "name": project.name,
            #         "fee": partial_fee if partial else fee,
            #         "hours": project_df["TimeInHs"].sum(),
            #         "partial": partial,
            #         "fixed": True
            #     }
