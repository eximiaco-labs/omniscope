from datetime import datetime
import pandas as pd
from typing import Dict, Any, List

from omni_shared import globals
from business_calendar import compute_business_calendar
from domain.cases import build_case_dictionary

from .models import (
    BusinessDay,
    BusinessCalendar,
    TimesheetAppointment,
    TimesheetSummary,
    NamedTimesheetSummary,
    TitledTimesheetSummary,
    DateTimesheetSummary,
    WeekTimesheetSummary,
    WeeklyHours,
    Timesheet
)

def summarize(df: pd.DataFrame) -> TimesheetSummary:
    if len(df) == 0:
        return TimesheetSummary()
        
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
    total_hours = float(df["TimeInHs"].sum())
    average_hours_per_entry = total_hours / len(df) if len(df) > 0 else 0.0

    weekly_summary = group_operations['week'].sum().reset_index()
    weeks = []
    for _, row in weekly_summary.iterrows():
        weeks.append(WeeklyHours(
            week=row['Week'],
            hours=float(row['TimeInHs'])
        ))

    # Extract scalar values from Series
    def get_agg_value(group: str, agg: str, default: float = 0.0) -> float:
        value = group_results[group][agg]
        return float(value.iloc[0]) if not pd.isna(value.iloc[0]) else default

    return TimesheetSummary(
        total_entries=len(df),
        total_hours=total_hours,
        unique_clients=df["ClientId"].nunique(),
        unique_workers=df["WorkerSlug"].nunique(),
        unique_cases=df["CaseId"].nunique(),
        unique_working_days=df["Date"].nunique(),
        unique_sponsors=df["Sponsor"].nunique(),
        unique_account_managers=df["AccountManagerSlug"].nunique(),
        unique_weeks=df["Week"].nunique(),
        average_hours_per_entry=average_hours_per_entry,
        std_dev_hours_per_entry=float(df["TimeInHs"].std() or 0.0),
        average_hours_per_day=get_agg_value("date", "mean"),
        std_dev_hours_per_day=get_agg_value("date", "std"),
        average_hours_per_worker=get_agg_value("worker", "mean"),
        std_dev_hours_per_worker=get_agg_value("worker", "std"),
        average_hours_per_client=get_agg_value("client", "mean"),
        std_dev_hours_per_client=get_agg_value("client", "std"),
        average_hours_per_case=get_agg_value("case", "mean"),
        std_dev_hours_per_case=get_agg_value("case", "std"),
        average_hours_per_sponsor=get_agg_value("sponsor", "mean"),
        std_dev_hours_per_sponsor=get_agg_value("sponsor", "std"),
        average_hours_per_account_manager=get_agg_value("account_manager", "mean"),
        std_dev_hours_per_account_manager=get_agg_value("account_manager", "std"),
        average_hours_per_week=get_agg_value("week", "mean"),
        std_dev_hours_per_week=get_agg_value("week", "std"),
        total_squad_hours=float(df[df['Kind'] == 'Squad']['TimeInHs'].sum() or 0.0),
        total_consulting_hours=float(df[df['Kind'] == 'Consulting']['TimeInHs'].sum() or 0.0),
        total_internal_hours=float(df[df['Kind'] == 'Internal']['TimeInHs'].sum() or 0.0),
        total_hands_on_hours=float(df[df['Kind'] == 'HandsOn']['TimeInHs'].sum() or 0.0),
        weekly_hours=weeks
    )

def summarize_by_kind(df: pd.DataFrame, map: Dict) -> Dict[str, TimesheetSummary]:
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
                s.by_worker = summarize_by_worker(df_kind, kind_map['byWorker'])

            summary_by_kind[label] = s

    return summary_by_kind

def summarize_by_group(
    df: pd.DataFrame, 
    group_column: str, 
    name_key: str = "name", 
    summary_class: type = NamedTimesheetSummary,
    map: Dict = None
) -> List[NamedTimesheetSummary]:
    if len(df) == 0:
        return []

    summaries = []
    for group_value, group_df in df.groupby(group_column):
        source_summary = summarize(group_df)
        source_summary_as_dict = source_summary.model_dump()
        source_summary_as_dict[name_key] = group_value
        
        # Calculate kind hours before creating the model
        kind_hours = {}
        for kind in ['Squad', 'Consulting', 'Internal', 'HandsOn']:
            kind_df = group_df[group_df['Kind'] == kind]
            hours = float(kind_df['TimeInHs'].sum() or 0.0)
            kind_key = f"total_{kind.lower()}_hours"
            if kind == 'HandsOn':
                kind_key = "total_hands_on_hours"
            kind_hours[kind_key] = hours
            
        # Merge all dictionaries
        summary_dict = {**source_summary_as_dict, **kind_hours}
        summary = summary_class(**summary_dict)

        if map and 'byKind' in map:
            summary.by_kind = summarize_by_kind(group_df, map['byKind'])
        
        if group_column != 'Week' and map and 'byWeek' in map:
            summary.by_week = summarize_by_week(group_df, map['byWeek'])

        if group_column == 'CaseTitle' and 'caseDetails' in map:
            details_obj = globals.omni_models.cases.get_by_title(group_value)
            summary.case_details = build_case_dictionary(map['caseDetails'], details_obj) if details_obj else {}
        
        if group_column == 'CaseTitle' and 'workers' in map:
            summary.workers = group_df['WorkerName'].unique().tolist()

        if group_column == 'CaseTitle' and 'workersByTrackingProject' in map:
            wdf = group_df[group_df['CaseTitle'] == group_value]
            workersByTrackingProject = wdf.groupby('ProjectId')['WorkerName'].agg(list).reset_index()
            summary.workers_by_tracking_project = [
                {
                    'project_id': row['ProjectId'],
                    'workers': sorted(set(row['WorkerName']))
                }   
                for _, row in workersByTrackingProject.iterrows()
            ]
            
        if group_column == 'CaseTitle' and 'byWorker' in map:
            summary.by_worker = summarize_by_worker(group_df, map['byWorker'])

        summaries.append(summary)

    return sorted(summaries, key=lambda x: x.total_hours, reverse=True)

def summarize_by_worker(df: pd.DataFrame, map: Dict) -> List[NamedTimesheetSummary]:
    return summarize_by_group(df, 'WorkerName', summary_class=NamedTimesheetSummary, map=map)

def summarize_by_client(df: pd.DataFrame, map: Dict) -> List[NamedTimesheetSummary]:
    return summarize_by_group(df, 'ClientName', summary_class=NamedTimesheetSummary, map=map)

def summarize_by_case(df: pd.DataFrame, map: Dict) -> List[TitledTimesheetSummary]:
    return summarize_by_group(df, 'CaseTitle', name_key="title", summary_class=TitledTimesheetSummary, map=map)

def summarize_by_sponsor(df: pd.DataFrame, map: Dict) -> List[NamedTimesheetSummary]:
    return summarize_by_group(df, 'Sponsor', summary_class=NamedTimesheetSummary, map=map)

def summarize_by_account_manager(df: pd.DataFrame, map: Dict) -> List[NamedTimesheetSummary]:
    return summarize_by_group(df, 'AccountManagerName', summary_class=NamedTimesheetSummary, map=map)

def summarize_by_date(df: pd.DataFrame, map: Dict) -> List[DateTimesheetSummary]:
    return summarize_by_group(df, 'Date', name_key="date", summary_class=DateTimesheetSummary, map=map)

def summarize_by_week(df: pd.DataFrame, map: Dict) -> List[WeekTimesheetSummary]:
    if len(df) == 0:
        return []

    summaries = summarize_by_group(df, 'Week', name_key="week", summary_class=WeekTimesheetSummary, map=map)
    
    # Sort the summaries based on the 'week' key
    sorted_summaries = sorted(summaries, key=lambda x: datetime.strptime(x.week.split(' - ')[0], '%d/%m'))
    
    return sorted_summaries

def summarize_by_offer(df: pd.DataFrame, map: Dict) -> List[NamedTimesheetSummary]:
    return summarize_by_group(df, 'ProductsOrServices', name_key="name", summary_class=NamedTimesheetSummary, map=map)

def get_appointments(df: pd.DataFrame) -> List[TimesheetAppointment]:
    appointments = []
    
    for _, row in df.iterrows():
        appointment_dict = {
            'date': row['Date'],
            'time_in_hs': row['TimeInHs'],
            'worker_name': row['WorkerName'],
            'worker_slug': row['WorkerSlug'],
            'client_id': row['ClientId'],
            'client_name': row['ClientName'],
            'case_id': row['CaseId'],
            'case_title': row['CaseTitle'],
            'project_id': row['ProjectId'],
            'products_or_services': row['ProductsOrServices'],
            'kind': row['Kind'],
            'sponsor': row['Sponsor'],
            'account_manager_name': row['AccountManagerName'],
            'account_manager_slug': row['AccountManagerSlug'],
            'week': row['Week']
        }
        appointments.append(TimesheetAppointment(**appointment_dict))
    return appointments

def compute_timesheet(map: Dict, slug: str, filters = None) -> Timesheet:
    if not slug.startswith('timesheet-'):
        slug = f'timesheet-{slug}'

    requested_fields = map.keys()

    timesheet = globals.omni_datasets.get_by_slug(slug)
    source = globals.omni_datasets.get_dataset_source_by_slug(slug)
    dates = globals.omni_datasets.get_dates(slug)
    df = timesheet.data

    df, result = globals.omni_datasets.apply_filters(
        source,
        df,
        filters
    )
    
    response_dict = {
        'slug': slug,
        'filterable_fields': result['filterable_fields']
    }
    
    
    
    # Check if any field other than the specific summary fields is requested
    base_fields = set(requested_fields) - {
        'byKind', 'byWorker', 'byClient', 'byCase', 'bySponsor', 
        'byAccountManager', 'byDate', 'byWeek', 'byOffer'
    }
    
    # Base summary
    if "summary" in requested_fields:
        response_dict['summary'] = summarize(df)
    
        
    if 'businessCalendar' in requested_fields:
        calendar = compute_business_calendar(dates[0], dates[1])
        response_dict['business_calendar'] = BusinessCalendar(
            days=[BusinessDay(**day) for day in calendar['days']],
            total_business_days=calendar['total_business_days'],
            total_holidays=calendar['total_holidays']
        )

    # By kind
    if 'byKind' in requested_fields:
        response_dict['by_kind'] = summarize_by_kind(df, map['byKind'])

    # By worker
    if 'byWorker' in requested_fields:
        response_dict['by_worker'] = summarize_by_worker(df, map['byWorker'])

    # By client
    if 'byClient' in requested_fields:
        response_dict['by_client'] = summarize_by_client(df, map['byClient'])

    # By case
    if 'byCase' in requested_fields:
        response_dict['by_case'] = summarize_by_case(df, map['byCase'])

    # By sponsor
    if 'bySponsor' in requested_fields:
        response_dict['by_sponsor'] = summarize_by_sponsor(df, map['bySponsor'])

    # By account manager
    if 'byAccountManager' in requested_fields:
        response_dict['by_account_manager'] = summarize_by_account_manager(df, map['byAccountManager'])

    # By date
    if 'byDate' in requested_fields:
        response_dict['by_date'] = summarize_by_date(df, map['byDate'])

    # By week
    if 'byWeek' in requested_fields:
        response_dict['by_week'] = summarize_by_week(df, map['byWeek'])
    
    if 'byOffer' in requested_fields:
        response_dict['by_offer'] = summarize_by_offer(df, map['byOffer'])
        
    if 'appointments' in requested_fields:
        response_dict['appointments'] = get_appointments(df)
        

    return Timesheet(**response_dict) 
