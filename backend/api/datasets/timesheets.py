import pandas as pd
from typing import Dict, Any, List, Union

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
    }


def summarize_by_kind(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    kinds = ['Internal', 'Consulting', 'Squad']
    summary_by_kind = {}

    for kind in kinds:
        df_kind = df[df['Kind'] == kind]
        summary_by_kind[kind.lower()] = summarize(df_kind)
    
    return summary_by_kind

def summarize_by_worker(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    worker_summaries = []
    for worker_name, worker_df in df.groupby('WorkerName'):
        worker_summary = summarize(worker_df)
        worker_summary["by_kind"] = summarize_by_kind(worker_df)
        worker_summary["name"] = worker_name

        # Add support for squad, consulting, and internal total hours
        worker_summary["total_squad_hours"] = worker_df[worker_df['Kind'] == 'Squad']['TimeInHs'].sum()
        worker_summary["total_consulting_hours"] = worker_df[worker_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        worker_summary["total_internal_hours"] = worker_df[worker_df['Kind'] == 'Internal']['TimeInHs'].sum()
        
        worker_summaries.append(worker_summary)
    return worker_summaries

def summarize_by_client(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    client_summaries = []
    for client_name, client_df in df.groupby('ClientName'):
        client_summary = summarize(client_df)
        client_summary["by_kind"] = summarize_by_kind(client_df)
        client_summary["name"] = client_name

        # Add support for squad, consulting, and internal total hours
        client_summary["total_squad_hours"] = client_df[client_df['Kind'] == 'Squad']['TimeInHs'].sum()
        client_summary["total_consulting_hours"] = client_df[client_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        client_summary["total_internal_hours"] = client_df[client_df['Kind'] == 'Internal']['TimeInHs'].sum()
        
        client_summaries.append(client_summary)
    return client_summaries

def summarize_by_case(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    case_summaries = []
    for case_title, case_df in df.groupby('CaseTitle'):
        case_summary = summarize(case_df)
        case_summary["by_kind"] = summarize_by_kind(case_df)
        case_summary["title"] = case_title

        # Add support for squad, consulting, and internal total hours
        case_summary["total_squad_hours"] = case_df[case_df['Kind'] == 'Squad']['TimeInHs'].sum()
        case_summary["total_consulting_hours"] = case_df[case_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        case_summary["total_internal_hours"] = case_df[case_df['Kind'] == 'Internal']['TimeInHs'].sum()
        
        case_summaries.append(case_summary)
    return case_summaries

def summarize_by_sponsor(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    sponsor_summaries = []
    for sponsor, sponsor_df in df.groupby('Sponsor'):
        sponsor_summary = summarize(sponsor_df)
        sponsor_summary["by_kind"] = summarize_by_kind(sponsor_df)
        sponsor_summary["name"] = sponsor

        # Add support for squad, consulting, and internal total hours
        sponsor_summary["total_squad_hours"] = sponsor_df[sponsor_df['Kind'] == 'Squad']['TimeInHs'].sum()
        sponsor_summary["total_consulting_hours"] = sponsor_df[sponsor_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        sponsor_summary["total_internal_hours"] = sponsor_df[sponsor_df['Kind'] == 'Internal']['TimeInHs'].sum()
        
        sponsor_summaries.append(sponsor_summary)
    return sponsor_summaries

def summarize_by_account_manager(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    account_manager_summaries = []
    for account_manager_name, account_manager_df in df.groupby('AccountManagerName'):
        account_manager_summary = summarize(account_manager_df)
        account_manager_summary["by_kind"] = summarize_by_kind(account_manager_df)
        account_manager_summary["name"] = account_manager_name

        # Add support for squad, consulting, and internal total hours
        account_manager_summary["total_squad_hours"] = account_manager_df[account_manager_df['Kind'] == 'Squad']['TimeInHs'].sum()
        account_manager_summary["total_consulting_hours"] = account_manager_df[account_manager_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        account_manager_summary["total_internal_hours"] = account_manager_df[account_manager_df['Kind'] == 'Internal']['TimeInHs'].sum()
        
        account_manager_summaries.append(account_manager_summary)
    return account_manager_summaries

def summarize_by_date(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    date_summaries = []
    for date, date_df in df.groupby('Date'):
        date_summary = summarize(date_df)
        date_summary["by_kind"] = summarize_by_kind(date_df)
        date_summary["date"] = date

        # Add support for squad, consulting, and internal total hours
        date_summary["total_squad_hours"] = date_df[date_df['Kind'] == 'Squad']['TimeInHs'].sum()
        date_summary["total_consulting_hours"] = date_df[date_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        date_summary["total_internal_hours"] = date_df[date_df['Kind'] == 'Internal']['TimeInHs'].sum()

        date_summaries.append(date_summary)
    return date_summaries

def summarize_by_week(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    week_summaries = []
    for week, week_df in df.groupby('Week'):
        week_summary = summarize(week_df)
        week_summary["by_kind"] = summarize_by_kind(week_df)
        week_summary["week"] = week

        # Add support for squad, consulting, and internal total hours
        week_summary["total_squad_hours"] = week_df[week_df['Kind'] == 'Squad']['TimeInHs'].sum()
        week_summary["total_consulting_hours"] = week_df[week_df['Kind'] == 'Consulting']['TimeInHs'].sum()
        week_summary["total_internal_hours"] = week_df[week_df['Kind'] == 'Internal']['TimeInHs'].sum()

        week_summaries.append(week_summary)
    return week_summaries

def compute_summaries(df: pd.DataFrame) -> Dict[str, Dict[str, Union[Dict[str, Any], Any]]]:
    base_summary = summarize(df)
    summaries = {
        **base_summary,  # Unpack the base summary as top-level fields
        "by_kind": summarize_by_kind(df),
        "by_worker": summarize_by_worker(df),
        "by_client": summarize_by_client(df),
        "by_case": summarize_by_case(df),
        "by_sponsor": summarize_by_sponsor(df),
        "by_account_manager": summarize_by_account_manager(df),
        "by_date": summarize_by_date(df),
        "by_week": summarize_by_week(df)
    }
    return summaries


def resolve_timesheet(_, info, slug: str=None, kind: str="ALL"):
    if not slug.startswith('timesheet-'):
        slug = f'timesheet-{slug}'

    timesheet = globals.omni_datasets.get_by_slug(slug)
    df = timesheet.data

    # Filter the dataframe based on the 'kind' parameter
    if kind != "ALL":
        df = df[df['Kind'] == kind.capitalize()]

    result = {}

    selections = info.field_nodes[0].selection_set.selections
    requested_fields = list(map(lambda s: s.name.value, selections))

    for selection in selections:
        if selection.kind == 'fragment_spread':
           fragment = info.fragments[selection.name.value]
           fragment_selections = fragment.selection_set.selections
           fragment_requested_fields = list(map(lambda s: s.name.value, fragment_selections))
           requested_fields += fragment_requested_fields

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