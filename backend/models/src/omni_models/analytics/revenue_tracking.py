import calendar
from omni_shared import globals

from datetime import date, datetime, timedelta
from omni_utils.helpers.slug import slugify
from omni_models.domain.cases import Case
import pandas as pd
from dataclasses import dataclass

INTERNAL_KIND = "Internal"
PROJECT_KINDS = ["consulting", "handsOn", "squad"]
NA_VALUE = "N/A"

def _get_account_manager_name(case):
    if not case.client_id:
        return NA_VALUE
    
    client = globals.omni_models.clients.get_by_id(case.client_id)
    return client.account_manager.name if client and client.account_manager else NA_VALUE

def _compute_revenue_tracking_base(df: pd.DataFrame, date_of_interest: date, process_project, account_manager_name_or_slug: str = None):
    pro_rata_info = { "by_kind": [] }
    
    if df is None or len(df) == 0:
        return {
            "monthly": {
                "total": 0,
                "total_consulting_fee": 0,
                "total_consulting_pre_fee": 0,
                "total_hands_on_fee": 0,
                "total_squad_fee": 0,
                "by_account_manager": []
            }
        }, pro_rata_info
        
    df = df[df["Kind"] != INTERNAL_KIND]
    if len(df) == 0:
        return {
            "monthly": {
                "total": 0,
                "total_consulting_fee": 0,
                "total_consulting_pre_fee": 0,
                "total_hands_on_fee": 0,
                "total_squad_fee": 0,
                "by_account_manager": []
            }
        }, pro_rata_info
    
    if account_manager_name_or_slug:
        df_ = df[df["AccountManagerName"] == account_manager_name_or_slug]
        if len(df_) == 0:
            df_ = df[df["AccountManagerSlug"] == account_manager_name_or_slug]
        df = df_
        if len(df) == 0:
            return {
                "monthly": {
                    "total": 0,
                    "total_consulting_fee": 0,
                    "total_consulting_pre_fee": 0,
                    "total_hands_on_fee": 0,
                    "total_squad_fee": 0,
                    "by_account_manager": []
                }
            }, pro_rata_info
    
    case_ids = df["CaseId"].unique()
    active_cases = [globals.omni_models.cases.get_by_id(case_id) for case_id in case_ids]
    account_managers_names = sorted(set(_get_account_manager_name(case) for case in active_cases))
    
    by_account_manager = []
    for account_manager_name in account_managers_names:
        by_client = []
        
        client_names = sorted(set(
            case.find_client_name(globals.omni_models.clients)
            for case in active_cases
            if _get_account_manager_name(case) == account_manager_name
        ))
        
        for client_name in client_names:
            sponsors_names = sorted(set(
                case.sponsor if case.sponsor else NA_VALUE
                for case in active_cases
                if case.find_client_name(globals.omni_models.clients) == client_name
            ))
            
            by_sponsor = []
            for sponsor_name in sponsors_names:
                by_case = []
                for case in active_cases:
                    if case.find_client_name(globals.omni_models.clients) == client_name and case.sponsor == sponsor_name:
                        by_project = []
                        for project in case.tracker_info:
                            project_data = process_project(date_of_interest, case, project, df, pro_rata_info)
                            if project_data:
                                by_project.append(project_data)
                    
                        if len(by_project) > 0:
                            consulting_hours = sum(
                                project["hours"] 
                                for project in by_project 
                                if project["kind"] == "consulting" and not project["fixed"]
                            )
                            consulting_fee = sum(
                                project["fee"] 
                                for project in by_project 
                                if project["kind"] == "consulting" and not project["fixed"]
                            )
                            
                            consulting_pre_hours = sum(
                                project["hours"] 
                                for project in by_project 
                                if project["kind"] == "consulting" and project["fixed"]
                            )
                            
                            if case.start_of_contract and case.start_of_contract.year == date_of_interest.year and case.start_of_contract.month == date_of_interest.month:
                                consulting_fee_new = consulting_fee
                            else:
                                consulting_fee_new = 0
                            
                            case_ = {
                                "title": case.title,
                                "slug": case.slug,
                                "fee": sum(project["fee"] for project in by_project),
                                "consulting_hours": consulting_hours,
                                "consulting_fee": consulting_fee,
                                "consulting_fee_new": consulting_fee_new,
                                "consulting_pre_hours": consulting_pre_hours,
                                "consulting_pre_fee": sum(project["fee"] for project in by_project if project["kind"] == "consulting" and project["fixed"]),
                                "hands_on_fee": sum(project["fee"] for project in by_project if project["kind"] == "handsOn"),
                                "squad_fee": sum(project["fee"] for project in by_project if project["kind"] == "squad"),
                                "by_project": sorted(by_project, key=lambda x: x["name"])
                            }
                            
                            if "partial" in by_project[0]:
                                case_["partial"] = any("partial" in project and project["partial"] for project in by_project)
                            
                            by_case.append(case_)
                
                if len(by_case) > 0:
                    sponsor_ = {
                        "name": sponsor_name,
                        "slug": slugify(sponsor_name),
                        "by_case": by_case, 
                        "fee": sum(case["fee"] for case in by_case),
                        "consulting_fee_new": sum(case["consulting_fee_new"] for case in by_case),
                        "consulting_hours": sum(case["consulting_hours"] for case in by_case),
                        "consulting_pre_hours": sum(case["consulting_pre_hours"] for case in by_case),
                        "consulting_fee": sum(case["consulting_fee"] for case in by_case),
                        "consulting_pre_fee": sum(case["consulting_pre_fee"] for case in by_case),
                        "hands_on_fee": sum(case["hands_on_fee"] for case in by_case),
                        "squad_fee": sum(case["squad_fee"] for case in by_case),
                        }
                    
                    if "partial" in by_case[0]:
                        sponsor_["partial"] = any("partial" in case and case["partial"] for case in by_case)
                    
                    by_sponsor.append(sponsor_)
            
            if len(by_sponsor) > 0:
                client = globals.omni_models.clients.get_by_name(client_name)
                client_ = {
                    "name": client_name,
                    "slug": client.slug if client else None,
                    "by_sponsor": by_sponsor,
                    "fee": sum(sponsor["fee"] for sponsor in by_sponsor),
                    "consulting_hours": sum(sponsor["consulting_hours"] for sponsor in by_sponsor),
                    "consulting_fee": sum(sponsor["consulting_fee"] for sponsor in by_sponsor),
                    "consulting_pre_hours": sum(sponsor["consulting_pre_hours"] for sponsor in by_sponsor),
                    "consulting_fee_new": sum(sponsor["consulting_fee_new"] for sponsor in by_sponsor),
                    "consulting_pre_fee": sum(sponsor["consulting_pre_fee"] for sponsor in by_sponsor),
                    "hands_on_fee": sum(sponsor["hands_on_fee"] for sponsor in by_sponsor),
                    "squad_fee": sum(sponsor["squad_fee"] for sponsor in by_sponsor),
                }
                
                if "partial" in by_sponsor[0]:
                    client_["partial"] = any("partial" in sponsor and sponsor["partial"] for sponsor in by_sponsor)
                
                by_client.append(client_)
        
        if len(by_client) > 0:
            account_manager = globals.omni_models.workers.get_by_name(account_manager_name)
            account_manager_ = {
                "name": account_manager_name,
                "slug": account_manager.slug if account_manager else None,
                "by_client": by_client,
                "fee": sum(client["fee"] for client in by_client),
                "consulting_hours": sum(client["consulting_hours"] for client in by_client),
                "consulting_pre_hours": sum(client["consulting_pre_hours"] for client in by_client),
                "consulting_fee": sum(client["consulting_fee"] for client in by_client),
                "consulting_fee_new": sum(client["consulting_fee_new"] for client in by_client),
                "consulting_pre_fee": sum(client["consulting_pre_fee"] for client in by_client),
                "hands_on_fee": sum(client["hands_on_fee"] for client in by_client),
                "squad_fee": sum(client["squad_fee"] for client in by_client),
            }
            
            if "partial" in by_client[0]:
                account_manager_["partial"] = any("partial" in client and client["partial"] for client in by_client)
            
            by_account_manager.append(account_manager_)
            
    total = sum(account_manager["fee"] for account_manager in by_account_manager)
    total_consulting_fee = sum(account_manager["consulting_fee"] for account_manager in by_account_manager)
    total_consulting_fee_new = sum(account_manager["consulting_fee_new"] for account_manager in by_account_manager)
    total_consulting_hours = sum(account_manager["consulting_hours"] for account_manager in by_account_manager)
    total_consulting_pre_hours = sum(account_manager["consulting_pre_hours"] for account_manager in by_account_manager)
    total_consulting_pre_fee = sum(account_manager["consulting_pre_fee"] for account_manager in by_account_manager)
    total_hands_on_fee = sum(account_manager["hands_on_fee"] for account_manager in by_account_manager)
    total_squad_fee = sum(account_manager["squad_fee"] for account_manager in by_account_manager)
    
    return {
        "monthly": {
            "total": total,
            "total_consulting_fee": total_consulting_fee,   
            "total_consulting_fee_new": total_consulting_fee_new,
            "total_consulting_pre_fee": total_consulting_pre_fee,
            "total_consulting_hours": total_consulting_hours,
            "total_consulting_pre_hours": total_consulting_pre_hours,
            "total_hands_on_fee": total_hands_on_fee,
            "total_squad_fee": total_squad_fee,
            "by_account_manager": by_account_manager
        }
    }, pro_rata_info

def compute_regular_revenue_tracking(
    df: pd.DataFrame,
    date_of_interest: date, 
    account_manager_name_or_slug: str = None
):
    def process_project(date_of_interest: date, _, project, timesheet_df, pro_rata_info):
        if project.rate and project.rate.rate:
            project_df = timesheet_df[timesheet_df["ProjectId"] == project.id]
            if len(project_df) > 0:
                by_worker = []
                for worker_name in project_df["WorkerName"].unique():
                    worker_df = project_df[project_df["WorkerName"] == worker_name]
                    worker = globals.omni_models.workers.get_by_name(worker_name)
                    by_worker.append({
                        "name": worker_name,
                        "slug": worker.slug if worker else None,
                        "hours": worker_df["TimeInHs"].sum(),
                        "fee": worker_df["Revenue"].sum()
                    })
                    
                return {
                    "kind": project.kind,
                    "name": project.name,
                    "rate": project.rate.rate / 100,
                    "hours": project_df["TimeInHs"].sum(),
                    "fee": project_df["Revenue"].sum(),
                    "fixed": False,
                    "by_worker": by_worker
                }
                
                
        return None
    
    return _compute_revenue_tracking_base(df, date_of_interest, process_project, account_manager_name_or_slug)[0]

def compute_pre_contracted_revenue_tracking(
    df: pd.DataFrame,
    date_of_interest: date, 
    account_manager_name_or_slug: str = None
):
    def process_project(date_of_interest: date, case: Case, project, timesheet_df: pd.DataFrame, pro_rata_info):
        project_df = timesheet_df[timesheet_df["ProjectId"] == project.id]
        result = None
        if project.billing and project.billing.fee and project.billing.fee != 0:
            if project.budget and project.budget.period == 'general':

                if not case.start_of_contract:
                    print(f'--> {project.name} has no start or end of contract')
                
                if len(timesheet_df) == 0 or "Date" not in timesheet_df.columns or timesheet_df["Date"].isna().all():
                    return None
                    
                d = timesheet_df[timesheet_df["Date"].notna()]["Date"].iloc[0]
                m = d.month
                y = d.year
                
                start = case.start_of_contract.replace(day=1)
                end = case.end_of_contract
                if end is None:
                    end = start
                
                in_contract = start.year <= y <= end.year

                if in_contract and y == start.year:
                    in_contract = m >= start.month

                if in_contract and y == end.year:
                    in_contract = m <= end.month

                if not in_contract:
                    return None

                if start.year == end.year:
                    number_of_months = end.month - start.month + 1
                else:
                    months_on_start_year = 12 - start.month + 1
                    months_on_end_year = end.month
                    if end.year - start.year > 1:
                        number_of_months = months_on_start_year + months_on_end_year + (end.year - start.year - 1) * 12
                    else:   
                        number_of_months = months_on_start_year + months_on_end_year
                        
                fee = project.billing.fee / 100 / number_of_months

                result = {
                    "kind": project.kind,
                    "name": project.name,
                    "fee": fee,
                    "hours": project_df["TimeInHs"].sum(),
                    "fixed": True
                }
            elif case.pre_contracted_value:
                fee = case.pre_contracted_value / 100
                
                should_do_pro_rata = (
                    case.start_of_contract 
                    and case.start_of_contract.year == date_of_interest.year 
                    and case.start_of_contract.month == date_of_interest.month
                )
                
                if should_do_pro_rata:
                    fee = fee * (date_of_interest.day / calendar.monthrange(date_of_interest.year, date_of_interest.month)[1])
                
                should_do_pro_rata = (
                    case.end_of_contract 
                    and case.end_of_contract.year == date_of_interest.year 
                    and case.end_of_contract.month == date_of_interest.month
                )
                
                if should_do_pro_rata:
                    fee = fee * (calendar.monthrange(date_of_interest.year, date_of_interest.month)[1] / date_of_interest.day)
                
                result = {
                    "kind": project.kind,
                    "name": project.name,
                    "fee": project.billing.fee / 100,
                    "hours": project_df["TimeInHs"].sum(),
                    "fixed": True
                }
            else:
                project_df = timesheet_df[timesheet_df["ProjectId"] == project.id]
                if len(project_df) == 0:
                    return None
                    
                partial = False
                fee = project.billing.fee / 100
                partial_fee = 0
                
                if project.kind != "consulting":    
                    is_last_day_of_month = date_of_interest.month != (date_of_interest + timedelta(days=1)).month
                    client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
                    if not client:
                        client_name = "N/A"
                        account_manager_name = "N/A"
                    else:
                        client_name = client.name
                        account_manager_name = client.account_manager.name if client.account_manager else "N/A"
                        
                    if is_last_day_of_month:
                        
                        workers_hours = project_df.groupby("WorkerName")["TimeInHs"].sum().reset_index()
                        if len(workers_hours) == 0:
                            return None
                            
                        number_of_workers = len(workers_hours)
                        fee_per_worker = fee / number_of_workers
                        hourly_fee = fee_per_worker / 160
                        
                        for worker_name, hours in workers_hours.values:
                            if hours < 140:
                                partial = True
                                partial_fee += hourly_fee * hours
                                
                                kinds = pro_rata_info["by_kind"]
                                
                                kind_info = next(
                                    (e for e in kinds if e["kind"] == project.kind),
                                    None
                                )
                                
                                if kind_info is None:
                                    kind_info = {
                                        "kind": project.kind,
                                        "penalty": 0,
                                        "by_account_manager": []
                                    }
                                    kinds.append(kind_info)
                                    
                                account_managers = kind_info["by_account_manager"]
                                
                                # Find or create account manager info
                                account_manager_info = next(
                                    (
                                        e for e in account_managers 
                                        if e["name"] == account_manager_name
                                    ),
                                    None
                                )
                                
                                if account_manager_info is None:
                                    account_manager_info = {
                                        "name": account_manager_name,
                                        "penalty": 0,
                                        "by_client": []
                                    }
                                    account_managers.append(account_manager_info)
                                
                                    
                                client_info = next(
                                    (
                                        e for e in account_manager_info["by_client"] 
                                        if e["name"] == client_name
                                    ),
                                    None
                                )
                                
                                if client_info is None:
                                    client_info = {
                                        "name": client_name,
                                        "penalty": 0,
                                        "by_sponsor": []
                                    }
                                    account_manager_info["by_client"].append(client_info)
                                
                                sponsor_info = next(
                                    (
                                        e for e in client_info["by_sponsor"] 
                                        if e["name"] == case.sponsor
                                    ),
                                    None
                                )
                                
                                if sponsor_info is None:
                                    sponsor_info = {
                                        "name": case.sponsor,
                                        "penalty": 0,
                                        "by_case": []
                                    }
                                    client_info["by_sponsor"].append(sponsor_info)
                                    
                                case_info = next(
                                    (
                                        e for e in sponsor_info["by_case"] 
                                        if e["title"] == case.title
                                    ),
                                    None
                                )
                                
                                if case_info is None:
                                    case_info = {
                                        "title": case.title,
                                        "penalty": 0,
                                        "by_project": []
                                    }
                                    sponsor_info["by_case"].append(case_info)
                                    
                                project_info = next(
                                    (
                                        e for e in case_info["by_project"] 
                                        if e["name"] == project.name
                                    ),
                                    None
                                )
                                
                                if project_info is None:
                                    project_info = {
                                        "name": project.name,
                                        "partial_fee": fee,
                                        "penalty": 0,
                                        "by_worker": []
                                    }
                                    case_info["by_project"].append(project_info)
                                    
                                penalty = fee_per_worker - (hourly_fee * hours)
                                project_info["by_worker"].append({
                                    "name": worker_name,
                                    "hours": hours,
                                    "partial_fee": hourly_fee * hours,
                                    "penalty": penalty
                                })
                                
                                project_info["partial_fee"] = project_info["partial_fee"] - penalty
                                project_info["penalty"] = project_info["penalty"] + penalty
                                case_info["penalty"] = case_info["penalty"] + penalty
                                sponsor_info["penalty"] = sponsor_info["penalty"] + penalty
                                client_info["penalty"] = client_info["penalty"] + penalty
                                account_manager_info["penalty"] = account_manager_info["penalty"] + penalty
                                kind_info["penalty"] = kind_info["penalty"] + penalty  
                                
                            
                # TODO: Verificar se tem algum colaborador lançando horas no primeiro dia de trabalho do mês
                # TODO: fator individual por trabalhador   
                # TODO: O que fazer com "trabalhaadores ocasionais"
         
                result = {
                    "kind": project.kind,
                    "name": project.name,
                    "fee": partial_fee if partial else fee,
                    "hours": project_df["TimeInHs"].sum(),
                    "partial": partial,
                    "fixed": True
                }
                
        if result and len(project_df) > 0:
            by_worker = []
            for worker_name in project_df["WorkerName"].unique():
                worker_df = project_df[project_df["WorkerName"] == worker_name]
                worker = globals.omni_models.workers.get_by_name(worker_name)
                by_worker.append({
                    "name": worker_name,
                    "slug": worker.slug if worker else None,
                    "hours": worker_df["TimeInHs"].sum(),
                })
            result["by_worker"] = by_worker
                
        return result
    
    return _compute_revenue_tracking_base(df, date_of_interest, process_project, account_manager_name_or_slug)

@dataclass
class AccountManagerSummary:
    name: str
    slug: str
    pre_contracted: float
    regular: float
    total: float
    consulting_fee: float
    consulting_pre_fee: float
    consulting_fee_new: float
    hands_on_fee: float
    squad_fee: float
    
    @staticmethod
    def build(account_manager_name, pre_contracted, regular):
        pre_contracted_fee = sum(
            account_manager["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        regular_fee = sum(
            account_manager["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        
        total_consulting_fee = sum(
            account_manager["consulting_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        ) 
        
        total_consulting_fee_new = sum(
            account_manager["consulting_fee_new"]
            for account_manager in regular["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        
        total_consulting_pre_fee = sum(
            account_manager["consulting_pre_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        ) + sum(
            account_manager["consulting_pre_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        
        total_hands_on_fee = sum(
            account_manager["hands_on_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        total_squad_fee = sum(
            account_manager["squad_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            if account_manager["name"] == account_manager_name
        )
        account_manager = globals.omni_models.workers.get_by_name(account_manager_name)
        
        return AccountManagerSummary(
            name=account_manager_name,
            slug=account_manager.slug if account_manager else None,
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
            consulting_fee=total_consulting_fee,
            consulting_pre_fee=total_consulting_pre_fee,
            consulting_fee_new=total_consulting_fee_new,
            hands_on_fee=total_hands_on_fee,
            squad_fee=total_squad_fee,
        )
    
    def build_list(pre_contracted, regular):
        account_managers_names = sorted(set(    
            account_manager["name"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
        ))
        
        return [
            AccountManagerSummary.build(account_manager_name, pre_contracted, regular) 
            for account_manager_name in account_managers_names
        ]
        
@dataclass
class ProjectSummary:
    name: str
    slug: str
    case_title: str
    pre_contracted: float
    regular: float
    total: float
    consulting_fee: float
    consulting_hours: float
    consulting_pre_hours: float
    consulting_pre_fee: float
    consulting_fee_new: float
    hands_on_fee: float
    squad_fee: float
    
    def get_fee(self, kind):
        if kind == "consulting":
            return self.consulting_fee
        elif kind == "consulting_pre":
            return self.consulting_pre_fee
        elif kind == "hands_on":
            return self.hands_on_fee
        elif kind == "squad":
            return self.squad_fee
        else:
            return 0
        
    @staticmethod
    def build(project_name, pre_contracted, regular):
        pre_contracted_fee = sum(
            project["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]  
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name
        )
        
        regular_fee = sum(
            project["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name
        )
        
        total_consulting_fee = sum(
            project["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        )
        
        total_consulting_fee_new = sum(
            project["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        )
        
        total_consulting_hours = sum(
            project["hours"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        )
        
        total_consulting_pre_hours = sum(
            project["hours"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        )
        
        total_consulting_pre_fee = sum(
            project["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        ) + sum(
            project["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "consulting"
        )
        
        total_hands_on_fee = sum(
            project["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "hands_on"
        )
        
        total_squad_fee = sum(
            project["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["name"] == project_name and project["kind"] == "squad"
        )
        
        case_title = globals.omni_models.cases.get_by_everhour_project_name(project_name).title
        
        return ProjectSummary(
            name=project_name,
            case_title=case_title,
            slug=slugify(project_name),
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
            consulting_hours=total_consulting_hours,
            consulting_pre_hours=total_consulting_pre_hours,
            consulting_fee=total_consulting_fee,
            consulting_pre_fee=total_consulting_pre_fee,
            consulting_fee_new=total_consulting_fee_new,
            hands_on_fee=total_hands_on_fee,
            squad_fee=total_squad_fee,
        )   
        
    @staticmethod
    def build_list(pre_contracted, regular, case_title = None):
        # First filter cases if needed to avoid unnecessary iterations
        def get_projects(data):
            projects = set()
            for account_manager in data["monthly"]["by_account_manager"]:
                for client in account_manager["by_client"]:
                    for sponsor in client["by_sponsor"]:
                        for case in sponsor["by_case"]:
                            if case_title is None or case["title"] == case_title:
                                for project in case["by_project"]:
                                    projects.add(project["name"])
            return projects
            
        # Combine projects from both sources
        project_names = sorted(
            get_projects(pre_contracted) | get_projects(regular)
        )
        
        return [
            ProjectSummary.build(project_name, pre_contracted, regular)
            for project_name in project_names
        ]
        
@dataclass
class CaseSummary:
    title: str
    slug: str
    pre_contracted: float
    regular: float
    total: float
    consulting_hours: float
    consulting_pre_hours: float
    consulting_fee: float
    consulting_pre_fee: float
    consulting_fee_new: float
    hands_on_fee: float
    squad_fee: float
    
    by_project: list[ProjectSummary]
    
    def get_fee(self, kind):
        if kind == "consulting":
            return self.consulting_fee
        elif kind == "consulting_pre":
            return self.consulting_pre_fee
        elif kind == "hands_on":
            return self.hands_on_fee
        elif kind == "squad":
            return self.squad_fee
        else:
            return 0
    
    @staticmethod
    def build(case_title, pre_contracted, regular):
        pre_contracted_fee = sum(
            case["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        regular_fee = sum(
            case["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_consulting_fee = sum(
            case["consulting_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_consulting_fee_new = sum(
            case["consulting_fee_new"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_consulting_hours = sum(
            case["consulting_hours"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_consulting_pre_hours = sum(
            case["consulting_pre_hours"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_consulting_pre_fee = sum(
            case["consulting_pre_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        ) + sum(
            case["consulting_pre_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_hands_on_fee = sum(
            case["hands_on_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        total_squad_fee = sum(
            case["squad_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if case["title"] == case_title
        )
        
        by_project = ProjectSummary.build_list(pre_contracted, regular, case_title)
        case = globals.omni_models.cases.get_by_title(case_title)
        
        return CaseSummary(
            title=case_title,
            slug=case.slug,
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
            consulting_hours=total_consulting_hours,
            consulting_pre_hours=total_consulting_pre_hours,
            consulting_fee=total_consulting_fee,
            consulting_pre_fee=total_consulting_pre_fee,
            consulting_fee_new=total_consulting_fee_new,
            hands_on_fee=total_hands_on_fee,
            squad_fee=total_squad_fee,
            by_project=by_project
        )
        
    @staticmethod
    def build_list(pre_contracted, regular, sponsor_name = None):
        case_titles = sorted(set(
            case["title"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            if sponsor_name is None or sponsor["name"] == sponsor_name
        ))
        
        return [
            CaseSummary.build(case_title, pre_contracted, regular)
            for case_title in case_titles
        ]
        
@dataclass
class SponsorSummary:
    name: str
    slug: str
    pre_contracted: float
    regular: float
    total: float
    consulting_fee: float
    consulting_fee_new: float
    consulting_hours: float
    consulting_pre_hours: float
    consulting_pre_fee: float
    hands_on_fee: float
    squad_fee: float
    
    def get_fee(self, kind):
        if kind == "consulting":
            return self.consulting_fee
        elif kind == "consulting_pre":
            return self.consulting_pre_fee
        elif kind == "hands_on":
            return self.hands_on_fee
        elif kind == "squad":
            return self.squad_fee
        else:
            return 0
    
    by_case: list[CaseSummary]
    
    @staticmethod
    def build(sponsor_name, pre_contracted, regular):
        pre_contracted_fee = sum(
            sponsor["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        regular_fee = sum(
            sponsor["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        
        total_consulting_fee = sum(
            sponsor["consulting_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        ) 
        
        total_consulting_fee_new = sum(
            sponsor["consulting_fee_new"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        
        total_consulting_hours = sum(
            sponsor["consulting_hours"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        
        total_consulting_pre_hours = sum(
            sponsor["consulting_pre_hours"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
            
        total_consulting_pre_fee = sum(
            sponsor["consulting_pre_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        ) + sum(
            sponsor["consulting_pre_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        
        total_hands_on_fee = sum(
            sponsor["hands_on_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        total_squad_fee = sum(
            sponsor["squad_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if sponsor["name"] == sponsor_name
        )
        
        by_case = CaseSummary.build_list(pre_contracted, regular, sponsor_name)
        
        return SponsorSummary(
            name=sponsor_name,
            slug=slugify(sponsor_name),
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
            consulting_fee=total_consulting_fee,
            consulting_fee_new=total_consulting_fee_new,
            consulting_hours=total_consulting_hours,
            consulting_pre_hours=total_consulting_pre_hours,
            consulting_pre_fee=total_consulting_pre_fee,
            hands_on_fee=total_hands_on_fee,
            squad_fee=total_squad_fee,
            by_case=by_case
        )
    
    @staticmethod
    def build_list(pre_contracted, regular, client_name = None):
        sponsors_names = sorted(set(
            sponsor["name"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            if client_name is None or client["name"] == client_name
        ))
        
        return [
            SponsorSummary.build(sponsor_name, pre_contracted, regular)
            for sponsor_name in sponsors_names
        ]


@dataclass
class ClientSummary:
    name: str
    slug: str
    pre_contracted: float
    regular: float
    total: float
    consulting_fee: float
    consulting_fee_new: float
    consulting_hours: float
    consulting_pre_hours: float
    consulting_pre_fee: float
    hands_on_fee: float
    squad_fee: float
    by_sponsor: list[SponsorSummary]
    
    def get_fee(self, kind):
        if kind == "consulting":
            return self.consulting_fee
        elif kind == "consulting_pre":
            return self.consulting_pre_fee
        elif kind == "hands_on":
            return self.hands_on_fee
        elif kind == "squad":
            return self.squad_fee
        else:
            return 0
    
    @staticmethod
    def build(client_name, pre_contracted, regular):
        pre_contracted_fee = sum(
            client["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        regular_fee = sum(
            client["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_consulting_fee = sum(
            client["consulting_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_consulting_fee_new = sum(
            client["consulting_fee_new"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_consulting_hours = sum(
            client["consulting_hours"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_consulting_pre_hours = sum(
            client["consulting_pre_hours"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )

        total_consulting_pre_fee = sum(
            client["consulting_pre_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        ) + sum(
            client["consulting_pre_fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_hands_on_fee = sum(
            client["hands_on_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        
        total_squad_fee = sum(
            client["squad_fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            if client["name"] == client_name
        )
        client = globals.omni_models.clients.get_by_name(client_name)
        by_sponsor = SponsorSummary.build_list(pre_contracted, regular, client_name)
        
        return ClientSummary(
            name=client_name,
            slug=client.slug if client else None,
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
            consulting_hours=total_consulting_hours,
            consulting_pre_hours=total_consulting_pre_hours,
            consulting_fee=total_consulting_fee,
            consulting_fee_new=total_consulting_fee_new,
            consulting_pre_fee=total_consulting_pre_fee,
            hands_on_fee=total_hands_on_fee,
            squad_fee=total_squad_fee,
            by_sponsor=by_sponsor
        )
    
    @staticmethod
    def build_list(pre_contracted, regular):
        clients_names = sorted(set(
            client["name"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
        ))
        
        return [
            ClientSummary.build(client_name, pre_contracted, regular)
            for client_name in clients_names
        ]
    
@dataclass
class KindSummary:
    name: str
    pre_contracted: float
    regular: float
    total: float

    @staticmethod
    def build(kind, pre_contracted, regular):
        pre_contracted_fee = sum(
            project["fee"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["kind"] == kind
        )
        regular_fee = sum(
            project["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            if project["kind"] == kind
        )
        
        return KindSummary(
            name=kind,
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee,
        )

    @staticmethod
    def build_list(pre_contracted, regular):
        return [
            KindSummary.build(kind, pre_contracted, regular)
            for kind in PROJECT_KINDS
        ]
        
@dataclass
class ConsultantSummary:
    name: str
    slug: str
    consulting_fee: float
    consulting_hours: float
    consulting_pre_hours: float
    
    @staticmethod
    def build(consultant_name, pre_contracted, regular):
        consulting_fee = sum(
            worker["fee"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            for worker in project["by_worker"]
            if worker["name"] == consultant_name
        )
        
        consulting_hours = sum(
            worker["hours"]
            for account_manager in regular["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            for worker in project["by_worker"]
            if worker["name"] == consultant_name
        )
        
        consulting_pre_hours = sum(
            worker["hours"]
            for account_manager in pre_contracted["monthly"]["by_account_manager"]
            for client in account_manager["by_client"]
            for sponsor in client["by_sponsor"]
            for case in sponsor["by_case"]
            for project in case["by_project"]
            for worker in project["by_worker"]
            if worker["name"] == consultant_name and project["kind"] == "consulting"
        )
       
        return ConsultantSummary(
            name=consultant_name,
            slug=globals.omni_models.workers.get_by_name(consultant_name).slug,
            consulting_fee=consulting_fee,
            consulting_hours=consulting_hours,
            consulting_pre_hours=consulting_pre_hours,
        )
        
    @staticmethod
    def build_list(pre_contracted, regular):
        return [
            ConsultantSummary.build(consultant_name, pre_contracted, regular)
            for consultant_name in set(
                worker["name"]
                for account_manager in regular["monthly"]["by_account_manager"]
                for client in account_manager["by_client"]
                for sponsor in client["by_sponsor"]
                for case in sponsor["by_case"]
                for project in case["by_project"]
                for worker in project["by_worker"]
            )
        ]
    
def compute_summaries(pre_contracted, regular):

    by_mode = {
        "pre_contracted": pre_contracted["monthly"]["total"],
        "regular": regular["monthly"]["total"],
        "total": pre_contracted["monthly"]["total"] + regular["monthly"]["total"]
    }
    
    return {
        "by_account_manager": AccountManagerSummary.build_list(pre_contracted, regular),
        "by_client": ClientSummary.build_list(pre_contracted, regular),
        "by_sponsor": SponsorSummary.build_list(pre_contracted, regular),
        "by_kind": KindSummary.build_list(pre_contracted, regular),
        "by_consultant": ConsultantSummary.build_list(pre_contracted, regular),
        "by_mode": by_mode,
    }
    
def compute_revenue_tracking(
    date_of_interest: date,
    account_manager_name_or_slug: str = None,
    filters = None
    ):
    
    year = date_of_interest.year
    month = date_of_interest.month
    
    s = datetime.combine(date(date_of_interest.year, date_of_interest.month, 1), datetime.min.time())
    e = datetime.combine(date_of_interest, datetime.max.time())
    
    pro_rata_info = { "by_kind": [] }
    timesheet = globals.omni_datasets.timesheets.get(s, e)
    df = timesheet.data
    
    if len(df) != 0:
        df = df[df["Kind"] != "Internal"]
    
    df, result = globals.omni_datasets.apply_filters(
        globals.omni_datasets.timesheets,
        df,
        filters
    )
    
    pre_contracted_computation = compute_pre_contracted_revenue_tracking(df, date_of_interest, account_manager_name_or_slug)
    pre_contracted = pre_contracted_computation[0]
    pro_rata_info = pre_contracted_computation[1]
    
    regular = compute_regular_revenue_tracking(df, date_of_interest, account_manager_name_or_slug)
    
    summaries = compute_summaries(pre_contracted, regular)
    
    return {
        "year": year,
        "month": month,
        "day": date_of_interest.day,
        "pre_contracted": pre_contracted,
        "pro_rata_info": pro_rata_info,
        "regular": regular,
        "summaries": summaries,
        "total": summaries["by_mode"]["pre_contracted"] + summaries["by_mode"]["regular"],
        "filterable_fields": result["filterable_fields"]
    }
