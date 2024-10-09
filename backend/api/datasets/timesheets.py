import pandas as pd
from typing import Dict, Any, List, Union
from api.utils.fields import get_requested_fields_from

import globals


def summarize(df: pd.DataFrame) -> Dict[str, Any]:
    # Precompute groupby operations
    date_group = df.groupby("Date")["TimeInHs"].sum()
    worker_group = df.groupby("WorkerSlug")["TimeInHs"].sum()
    client_group = df.groupby("ClientId")["TimeInHs"].sum()
    case_group = df.groupby("CaseId")["TimeInHs"].sum()
    sponsor_group = df.groupby("Sponsor")["TimeInHs"].sum()
    account_manager_group = df.groupby("AccountManagerSlug")["TimeInHs"].sum()
    week_group = df.groupby("Week")["TimeInHs"].sum()

    # Calculate statistics
    total_hours = df["TimeInHs"].sum()
    average_hours_per_entry = total_hours / len(df)

    return {
        "total_entries": len(df),
        "total_hours": total_hours,
        "unique_clients": df["ClientId"].nunique(),
        "unique_workers": df["WorkerSlug"].nunique(),
        "unique_cases": df["CaseId"].nunique(),
        "unique_working_days": df["Date"].nunique(),
        "unique_sponsors": df["Sponsor"].nunique(),
        "unique_account_managers": df["AccountManagerSlug"].nunique(),
        "unique_weeks": df["Week"].nunique(),
        "average_hours_per_entry": average_hours_per_entry,
        "std_dev_hours_per_entry": df["TimeInHs"].std(),
        "average_hours_per_day": date_group.mean(),
        "std_dev_hours_per_day": date_group.std(),
        "average_hours_per_worker": worker_group.mean(),
        "std_dev_hours_per_worker": worker_group.std(),
        "average_hours_per_client": client_group.mean(),
        "std_dev_hours_per_client": client_group.std(),
        "average_hours_per_case": case_group.mean(),
        "std_dev_hours_per_case": case_group.std(),
        "average_hours_per_sponsor": sponsor_group.mean(),
        "std_dev_hours_per_sponsor": sponsor_group.std(),
        "average_hours_per_account_manager": account_manager_group.mean(),
        "std_dev_hours_per_account_manager": account_manager_group.std(),
        "average_hours_per_week": week_group.mean(),
        "std_dev_hours_per_week": week_group.std(),
        "total_squad_hours": df[df['Kind'] == 'Squad']['TimeInHs'].sum(),
        "total_consulting_hours": df[df['Kind'] == 'Consulting']['TimeInHs'].sum(),
        "total_internal_hours": df[df['Kind'] == 'Internal']['TimeInHs'].sum(),

    }


def summarize_by_kind(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    kinds = ['Internal', 'Consulting', 'Squad']
    summary_by_kind = {}

    for kind in kinds:
        df_kind = df[df['Kind'] == kind]
        summary_by_kind[kind.lower()] = summarize(df_kind)
    
    return summary_by_kind

def summarize_by_group(df: pd.DataFrame, group_column: str, name_key: str = "name") -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    summaries = []
    for group_value, group_df in df.groupby(group_column):
        summary = summarize(group_df)
        summary["by_kind"] = summarize_by_kind(group_df)
        summary[name_key] = group_value

        # Add support for squad, consulting, and internal total hours
        for kind in ['Squad', 'Consulting', 'Internal']:
            summary[f"total_{kind.lower()}_hours"] = group_df[group_df['Kind'] == kind]['TimeInHs'].sum()
        
        summaries.append(summary)

    summaries = sorted(summaries, key=lambda x: x["total_hours"], reverse=True)
    return summaries

def summarize_by_worker(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'WorkerName')

def summarize_by_client(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'ClientName')

def summarize_by_case(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'CaseTitle', name_key="title")

def summarize_by_sponsor(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'Sponsor')

def summarize_by_account_manager(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'AccountManagerName')

def summarize_by_date(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'Date', name_key="date")

def summarize_by_week(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'Week', name_key="week")

def compute_timesheet(requested_fields, slug: str=None, kind: str="ALL"):
    if not slug.startswith('timesheet-'):
        slug = f'timesheet-{slug}'
    
    timesheet = globals.omni_datasets.get_by_slug(slug)
    df = timesheet.data

    # Filter the dataframe based on the 'kind' parameter
    if kind != "ALL":
        df = df[df['Kind'] == kind.capitalize()]

    result = {}


    # Check if any field other than the specific summary fields is requested
    base_fields = set(requested_fields) - {
        'byKind', 'byWorker', 'byClient', 'byCase', 'bySponsor', 
        'byAccountManager', 'byDate', 'byWeek'
    }
    
    # Base summary
    if base_fields:
        result.update(summarize(df))

    # By kind
    if 'byKind' in requested_fields:
        result['by_kind'] = summarize_by_kind(df)

    # By worker
    if 'byWorker' in requested_fields:
        result['by_worker'] = summarize_by_worker(df)

    # By client
    if 'byClient' in requested_fields:
        result['by_client'] = summarize_by_client(df)

    # By case
    if 'byCase' in requested_fields:
        result['by_case'] = summarize_by_case(df)

    # By sponsor
    if 'bySponsor' in requested_fields:
        result['by_sponsor'] = summarize_by_sponsor(df)

    # By account manager
    if 'byAccountManager' in requested_fields:
        result['by_account_manager'] = summarize_by_account_manager(df)

    # By date
    if 'byDate' in requested_fields:
        result['by_date'] = summarize_by_date(df)

    # By week
    if 'byWeek' in requested_fields:
        result['by_week'] = summarize_by_week(df)

    return result

def resolve_timesheet(_, info, slug: str=None, kind: str="ALL"):
    requested_fields = get_requested_fields_from(info)
    return compute_timesheet(requested_fields, slug, kind)