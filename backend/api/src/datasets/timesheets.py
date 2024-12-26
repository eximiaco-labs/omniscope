
from datetime import datetime
import pandas as pd
from typing import Dict, Any, List, Union


from graphql import GraphQLResolveInfo

from utils.fields import build_fields_map, get_requested_fields_from, get_selections_from_info
from omni_utils.helpers.slug import slugify

from business_calendar import compute_business_calendar

from omni_shared import globals


def summarize(df: pd.DataFrame) -> Dict[str, Any]:
    if len(df) == 0:
        return {
            "total_entries": 0,
            "total_hours": 0,
            "unique_clients": 0, 
            "unique_workers": 0,
            "unique_cases": 0,
            "unique_working_days": 0,
            "unique_sponsors": 0,
            "unique_account_managers": 0,
            "unique_weeks": 0,
            "average_hours_per_entry": 0,
            "std_dev_hours_per_entry": 0,
            "average_hours_per_day": 0,
            "std_dev_hours_per_day": 0,
            "average_hours_per_worker": 0,
            "std_dev_hours_per_worker": 0,
            "average_hours_per_client": 0,
            "std_dev_hours_per_client": 0,
            "average_hours_per_case": 0,
            "std_dev_hours_per_case": 0,
            "average_hours_per_sponsor": 0,
            "std_dev_hours_per_sponsor": 0,
            "average_hours_per_account_manager": 0,
            "std_dev_hours_per_account_manager": 0,
            "average_hours_per_week": 0,
            "std_dev_hours_per_week": 0,
            "total_squad_hours": 0,
            "total_consulting_hours": 0,
            "total_internal_hours": 0,
            "total_hands_on_hours": 0,
            "weekly_hours": []
        }

    # Perform groupby operations once
    group_operations = {
        "date": df.groupby("Date")["TimeInHs"],
        "worker": df.groupby("WorkerSlug")["TimeInHs"],
        "client": df.groupby("ClientId")["TimeInHs"],
        "case": df.groupby("CaseId")["TimeInHs"],
        "sponsor": df.groupby("Sponsor")["TimeInHs"],
        "account_manager": df.groupby("AccountManagerSlug")["TimeInHs"],
        "week": df.groupby("Week")["TimeInHs"]
    }

    group_results = {k: g.agg(['sum', 'mean', 'std']) for k, g in group_operations.items()}

    # Calculate statistics
    total_hours = df["TimeInHs"].sum()
    average_hours_per_entry = total_hours / len(df) if len(df) > 0 else 0

    weekly_summary = group_operations['week'].sum().reset_index()
    weeks = []
    for _, row in weekly_summary.iterrows():
        weeks.append({
            'week': row['Week'],
            'hours': row['TimeInHs']
        })

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
        "average_hours_per_day": group_results["date"]['mean'],
        "std_dev_hours_per_day": group_results["date"]['std'],
        "average_hours_per_worker": group_results["worker"]['mean'],
        "std_dev_hours_per_worker": group_results["worker"]['std'],
        "average_hours_per_client": group_results["client"]['mean'],
        "std_dev_hours_per_client": group_results["client"]['std'],
        "average_hours_per_case": group_results["case"]['mean'],
        "std_dev_hours_per_case": group_results["case"]['std'],
        "average_hours_per_sponsor": group_results["sponsor"]['mean'],
        "std_dev_hours_per_sponsor": group_results["sponsor"]['std'],
        "average_hours_per_account_manager": group_results["account_manager"]['mean'],
        "std_dev_hours_per_account_manager": group_results["account_manager"]['std'],
        "average_hours_per_week": group_results["week"]['mean'],
        "std_dev_hours_per_week": group_results["week"]['std'],
        "total_squad_hours": df[df['Kind'] == 'Squad']['TimeInHs'].sum(),
        "total_consulting_hours": df[df['Kind'] == 'Consulting']['TimeInHs'].sum(),
        "total_internal_hours": df[df['Kind'] == 'Internal']['TimeInHs'].sum(),
        "total_hands_on_hours": df[df['Kind'] == 'HandsOn']['TimeInHs'].sum(),
        "weekly_hours": weeks
    }

def summarize_by_kind(df: pd.DataFrame, map: Dict) -> Dict[str, Dict[str, Any]]:
    if len(df) == 0:
        return {}

    kinds = ['Internal', 'Consulting', 'Squad', 'HandsOn']
    summary_by_kind = {}

    for kind in kinds:
        kind_in_map = 'handsOn' if kind == 'HandsOn' else kind.lower()
        if kind_in_map in map:
            kind_map = map[kind_in_map]
            df_kind = df[df['Kind'] == kind]

            if len(df_kind) == 0:
                continue

            if kind == 'HandsOn':
                label = 'hands_on'
            else:
                label = kind.lower()

            s = summarize(df_kind)

            if 'byWorker' in kind_map:
                s['by_worker'] = summarize_by_worker(df_kind, kind_map['byWorker'])

            summary_by_kind[label] = s

    return summary_by_kind

def summarize_by_group(df: pd.DataFrame, group_column: str, name_key: str = "name", map: Dict = None) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    if len(df) == 0:
        return []

    summaries = []
    for group_value, group_df in df.groupby(group_column):
        summary = summarize(group_df)
        summary[name_key] = group_value

        for kind in ['Squad', 'Consulting', 'Internal', 'HandsOn']:
            summary[f"total_{kind.lower()}_hours"] = group_df[group_df['Kind'] == kind]['TimeInHs'].sum()

        summary["by_kind"] = summarize_by_kind(group_df, map['byKind']) if map and 'byKind' in map else None
        if group_column != 'Week':
            summary['by_week'] = summarize_by_week(group_df, map['byWeek']) if map and 'byWeek' in map else None

        if group_column == 'CaseTitle' and 'caseDetails' in map:
            from domain.cases import build_case_dictionary
            
            details_obj = globals.omni_models.cases.get_by_title(group_value)
            if details_obj:
                details = build_case_dictionary(map['caseDetails'], details_obj)
            else:
                details = {}

            summary['case_details'] = details
        
        if group_column == 'CaseTitle' and 'workers' in map:
            workers = df[df['CaseTitle'] == group_value]['WorkerName'].unique().tolist()
            summary['workers'] = workers

        if group_column == 'CaseTitle' and 'workersByTrackingProject' in map:
            wdf = df[df['CaseTitle'] == group_value]
            workersByTrackingProject = wdf.groupby('ProjectId')['WorkerName'].agg(list).reset_index()
            project_workers = [
                {
                    'project_id': row['ProjectId'],
                    'workers': sorted(set(row['WorkerName']))
                }   
                for _, row in workersByTrackingProject.iterrows()
            ]
            summary['workers_by_tracking_project'] = project_workers
            
        if group_column == 'CaseTitle' and 'byWorker' in map:
            summary['by_worker'] = summarize_by_worker(group_df, map['byWorker'])

        summaries.append(summary)

    summaries = sorted(summaries, key=lambda x: x["total_hours"], reverse=True)
    return summaries

def summarize_by_worker(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'WorkerName', map=map)

def summarize_by_client(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'ClientName', map=map)

def summarize_by_case(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'CaseTitle', name_key="title", map=map)

def summarize_by_sponsor(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'Sponsor', map=map)

def summarize_by_account_manager(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'AccountManagerName', map=map)

def summarize_by_date(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'Date', name_key="date", map=map)

def summarize_by_week(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    if len(df) == 0:
        return []

    summaries = summarize_by_group(df, 'Week', name_key="week", map=map)
    
    # Sort the summaries based on the 'week' key
    sorted_summaries = sorted(summaries, key=lambda x: datetime.strptime(x['week'].split(' - ')[0], '%d/%m'))
    
    return sorted_summaries

def summarize_by_offer(df: pd.DataFrame, map: Dict) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'ProductsOrServices', name_key="name", map=map)

def compute_timesheet(map, slug: str=None, kind: str="ALL", filters = None):
    if not slug.startswith('timesheet-'):
        slug = f'timesheet-{slug}'

    requested_fields = map.keys()

    timesheet = globals.omni_datasets.get_by_slug(slug)
    source = globals.omni_datasets.get_dataset_source_by_slug(slug)
    dates = globals.omni_datasets.get_dates(slug)
    df = timesheet.data

    # Filter the dataframe based on the 'kind' parameter
    if len(df) > 0 and kind != "ALL":
        df = df[df['Kind'] == kind.capitalize()]

    df, result = globals.omni_datasets.apply_filters(
        source,
        df,
        filters
    )
    
    # Check if any field other than the specific summary fields is requested
    base_fields = set(requested_fields) - {
        'byKind', 'byWorker', 'byClient', 'byCase', 'bySponsor', 
        'byAccountManager', 'byDate', 'byWeek', 'byOffer'
    }
    
    # Base summary
    if base_fields:
        result.update(summarize(df))
        
    if 'businessCalendar' in requested_fields:
        result['business_calendar'] = compute_business_calendar(dates[0], dates[1])

    # By kind
    if 'byKind' in requested_fields:
        result['by_kind'] = summarize_by_kind(df, map['byKind'])

    # By worker
    if 'byWorker' in requested_fields:
        result['by_worker'] = summarize_by_worker(df, map['byWorker'])

    # By client
    if 'byClient' in requested_fields:
        result['by_client'] = summarize_by_client(df, map['byClient'])

    # By case
    if 'byCase' in requested_fields:
        result['by_case'] = summarize_by_case(df, map['byCase'])

    # By sponsor
    if 'bySponsor' in requested_fields:
        result['by_sponsor'] = summarize_by_sponsor(df, map['bySponsor'])

    # By account manager
    if 'byAccountManager' in requested_fields:
        result['by_account_manager'] = summarize_by_account_manager(df, map['byAccountManager'])

    # By date
    if 'byDate' in requested_fields:
        result['by_date'] = summarize_by_date(df, map['byDate'])

    # By week
    if 'byWeek' in requested_fields:
        result['by_week'] = summarize_by_week(df, map['byWeek'])
    
    if 'byOffer' in requested_fields:
        result['by_offer'] = summarize_by_offer(df, map['byOffer'])
        
    if 'appointments' in requested_fields:
        def summarize_appointments(df, fields):
            appointments = []
            
            fields_slugs = {}
            for field in fields:
                # Convert camelCase to snake_case
                parts = []
                current_part = field[0].lower()
                for c in field[1:]:
                    if c.isupper():
                        parts.append(current_part)
                        current_part = c.lower()
                    else:
                        current_part += c
                parts.append(current_part)
                field_slug = '_'.join(parts)
                fields_slugs[field] = field_slug
            
            for _, row in df.iterrows():
                appointment = {}
                for field in fields:
                    field_slug = fields_slugs[field]
                    appointment[field_slug] = row[field]
                appointments.append(appointment)
            return appointments
        
        result['appointments'] = summarize_appointments(df, globals.omni_datasets.timesheets.get_all_fields())

    return result

def resolve_timesheet(_, info, slug: str, kind: str = "ALL", filters = None):
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, kind, filters)
    return result

