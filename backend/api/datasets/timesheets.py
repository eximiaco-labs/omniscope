
from datetime import datetime
import pandas as pd
from typing import Dict, Any, List, Union

from graphql import GraphQLResolveInfo

from api.utils.fields import get_requested_fields_from, get_selections_from_info

import globals

def summarize(df: pd.DataFrame) -> Dict[str, Any]:
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
    }



def summarize_by_kind(df: pd.DataFrame, map: Dict) -> Dict[str, Dict[str, Any]]:
    kinds = ['Internal', 'Consulting', 'Squad', 'HandsOn']
    summary_by_kind = {}

    for kind in kinds:
        df_kind = df[df['Kind'] == kind]

        if kind == 'HandsOn':
            label = 'hands_on'
        else:
            label = kind.lower()
            
        summary_by_kind[label] = summarize(df_kind)
    
    return summary_by_kind

def summarize_by_group(df: pd.DataFrame, group_column: str, name_key: str = "name", map: Dict = None) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
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
            details_obj = globals.omni_models.cases.get_by_title(group_value)
            if details_obj:
                details = {**details_obj.__dict__}

                # Add all properties
                for prop in dir(details_obj):
                    if not prop.startswith('_') and prop not in details:
                        details[prop] = getattr(details_obj, prop)

                if details['client_id'] and 'client' in map['caseDetails']:
                    details['client'] = globals.omni_models.clients.get_by_id(details['client_id'])
                else:
                    details['client'] = None
            else:
                details = {}

            summary['case_details'] = details

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
    df = timesheet.data

    # Filter the dataframe based on the 'kind' parameter
    if kind != "ALL":
        df = df[df['Kind'] == kind.capitalize()]

    # Compose filterable_fields and apply filters
    filterable_fields = source.get_filterable_fields()
    result = {'filterable_fields': []}
    
    for field in filterable_fields:
        options = sorted([value for value in df[field].unique().tolist() if value is not None])
        selected_values = []
        
        if filters:
            for filter_item in filters:
                if filter_item['field'] == field:
                    selected_values = filter_item['selected_values']
                    break
        
        result['filterable_fields'].append({
            'field': field,
            'selected_values': selected_values,
            'options': options
        })
        
        # Apply filter to dataframe
        if selected_values:
            df = df[df[field].isin(selected_values)]

    # Check if any field other than the specific summary fields is requested
    base_fields = set(requested_fields) - {
        'byKind', 'byWorker', 'byClient', 'byCase', 'bySponsor', 
        'byAccountManager', 'byDate', 'byWeek', 'byOffer'
    }
    
    # Base summary
    if base_fields:
        result.update(summarize(df))

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

    return result

def resolve_timesheet(_, info, slug: str, kind: str = "ALL", filters = None):
    requested_fields = get_requested_fields_from(info)
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, kind, filters)
    return result

def build_fields_map(info):
    selections = get_selections_from_info(info)
    fields_map = {}
    for selection in selections:
        new_info = GraphQLResolveInfo(
            field_name=selection.name.value,
            field_nodes=[selection],
            return_type=info.return_type,
            parent_type=info.parent_type,
            schema=info.schema,
            fragments=info.fragments,
            root_value=info.root_value,
            operation=info.operation,
            variable_values=info.variable_values,
            context=info.context,
            path=info.path,
            is_awaitable=info.is_awaitable
        )
        fields_map[selection.name.value] = build_fields_map(new_info) if selection.selection_set else None
    return fields_map
