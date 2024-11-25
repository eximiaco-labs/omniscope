import globals

from datetime import date, datetime
from models.helpers.slug import slugify
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

def _compute_revenue_tracking_base(date_of_interest: date, process_project):
    s = datetime.combine(date(date_of_interest.year, date_of_interest.month, 1), datetime.min.time())
    e = datetime.combine(date_of_interest, datetime.max.time())
    
    timesheet = globals.omni_datasets.timesheets.get(s, e)
    df = timesheet.data
    df = df[df["Kind"] != INTERNAL_KIND]
    
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
                            project_data = process_project(project, df)
                            if project_data:
                                by_project.append(project_data)
                    
                        if len(by_project) > 0:
                            by_case.append({
                                "title": case.title,
                                "slug": case.slug,
                                "fee": sum(project["fee"] for project in by_project),
                                "by_project": sorted(by_project, key=lambda x: x["name"])
                            })
                
                if len(by_case) > 0:
                    by_sponsor.append({
                        "name": sponsor_name,
                        "slug": slugify(sponsor_name),
                        "by_case": by_case, 
                        "fee": sum(case["fee"] for case in by_case)
                    })
            
            if len(by_sponsor) > 0:
                client = globals.omni_models.clients.get_by_name(client_name)
                by_client.append({
                    "name": client_name,
                    "slug": client.slug if client else None,
                    "by_sponsor": by_sponsor,
                    "fee": sum(sponsor["fee"] for sponsor in by_sponsor)
                })
        
        if len(by_client) > 0:
            account_manager = globals.omni_models.workers.get_by_name(account_manager_name)
            by_account_manager.append({
                "name": account_manager_name,
                "slug": account_manager.slug if account_manager else None,
                "by_client": by_client,
                "fee": sum(client["fee"] for client in by_client)
            })
            
    total = sum(account_manager["fee"] for account_manager in by_account_manager)
    
    return {
        "monthly": {
            "total": total,
            "by_account_manager": by_account_manager
        }
    }

def compute_regular_revenue_tracking(date_of_interest: date):
    def process_project(project, timesheet_df):
        if project.rate and project.rate.rate:
            project_df = timesheet_df[timesheet_df["ProjectId"] == project.id]
            if len(project_df) > 0:
                return {
                    "kind": project.kind,
                    "name": project.name,
                    "rate": project.rate.rate / 100,
                    "hours": project_df["TimeInHs"].sum(),
                    "fee": project_df["Revenue"].sum()
                }
        return None
    
    return _compute_revenue_tracking_base(date_of_interest, process_project)

def compute_pre_contracted_revenue_tracking(date_of_interest: date):
    def process_project(project, _):
        if project.billing and project.billing.fee and project.billing.fee != 0:
            return {
                "kind": project.kind,
                "name": project.name,
                "fee": project.billing.fee / 100
            }
        return None 
    
    return _compute_revenue_tracking_base(date_of_interest, process_project)

@dataclass
class AccountManagerSummary:
    name: str
    slug: str
    pre_contracted: float
    regular: float
    total: float
    
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
        account_manager = globals.omni_models.workers.get_by_name(account_manager_name)
        
        return AccountManagerSummary(
            name=account_manager_name,
            slug=account_manager.slug if account_manager else None,
            pre_contracted=pre_contracted_fee,
            regular=regular_fee,
            total=pre_contracted_fee + regular_fee
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
    
def compute_summary_by_client(pre_contracted, regular):
    clients_names = sorted(set(
        client["name"]
        for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
        for client in account_manager["by_client"]
    ))
    
    by_client = []
    for client_name in clients_names:
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
        client = globals.omni_models.clients.get_by_name(client_name)
        by_client.append({
            "name": client_name,
            "slug": client.slug if client else None,
            "pre_contracted": pre_contracted_fee,
            "regular": regular_fee,
            "total": pre_contracted_fee + regular_fee
        })
    
    return by_client
    
def compute_summary_by_sponsor(pre_contracted, regular):
    sponsors_names = sorted(set(
        sponsor["name"]
        for account_manager in pre_contracted["monthly"]["by_account_manager"] + regular["monthly"]["by_account_manager"]
        for client in account_manager["by_client"]
        for sponsor in client["by_sponsor"]
    ))
    
    by_sponsor = []
    for sponsor_name in sponsors_names:
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
        by_sponsor.append({
            "name": sponsor_name,
            "slug": slugify(sponsor_name),
            "pre_contracted": pre_contracted_fee,
            "regular": regular_fee,
            "total": pre_contracted_fee + regular_fee
        })
    
    return by_sponsor

def compute_summary_by_kind(pre_contracted, regular):
    kinds = ["consulting", "handsOn", "squad"]
    
    by_kind = []
    for kind in kinds:
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
        by_kind.append({
            "name": kind,
            "pre_contracted": pre_contracted_fee,
            "regular": regular_fee,
            "total": pre_contracted_fee + regular_fee
        })
    
    return by_kind

def compute_summaries(pre_contracted, regular):
    by_client = compute_summary_by_client(pre_contracted, regular)
    by_sponsor = compute_summary_by_sponsor(pre_contracted, regular)
    by_kind = compute_summary_by_kind(pre_contracted, regular)
    by_mode = {
        "pre_contracted": pre_contracted["monthly"]["total"],
        "regular": regular["monthly"]["total"],
        "total": pre_contracted["monthly"]["total"] + regular["monthly"]["total"]
    }
    
    return {
        "by_account_manager": AccountManagerSummary.build_list(pre_contracted, regular),
        "by_client": by_client,
        "by_sponsor": by_sponsor,
        "by_kind": by_kind,
        "by_mode": by_mode,
    }
    
def compute_revenue_tracking(date_of_interest: date):
    year = date_of_interest.year
    month = date_of_interest.month
    
    pre_contracted = compute_pre_contracted_revenue_tracking(date_of_interest)
    regular = compute_regular_revenue_tracking(date_of_interest)
    
    summaries = compute_summaries(pre_contracted, regular)
    
    return {
        "year": year,
        "month": month,
        "day": date_of_interest.day,
        "pre_contracted": pre_contracted,
        "regular": regular,
        "summaries": summaries,
        "total": summaries["by_mode"]["pre_contracted"] + summaries["by_mode"]["regular"]
    }
