from datetime import datetime
import pandas as pd
from typing import Dict, Any, List, Union, Optional
from pydantic import BaseModel, Field

from graphql import GraphQLResolveInfo

from utils.fields import build_fields_map, get_requested_fields_from, get_selections_from_info
from omni_utils.helpers.slug import slugify

from business_calendar import compute_business_calendar

from omni_shared import globals


class WeeklyHours(BaseModel):
    week: str
    hours: float

class BusinessDay(BaseModel):
    date: datetime
    is_business_day: bool
    is_holiday: bool
    holiday_name: Optional[str] = None

class BusinessCalendar(BaseModel):
    days: List[BusinessDay]
    total_business_days: int
    total_holidays: int

class TimesheetAppointment(BaseModel):
    date: datetime
    time_in_hs: float
    worker_name: str
    worker_slug: str
    client_id: str
    client_name: str
    case_id: str
    case_title: str
    project_id: str
    products_or_services: str
    kind: str
    sponsor: str
    account_manager_name: str
    account_manager_slug: str
    week: str

class TimesheetSummary(BaseModel):
    total_entries: int = 0
    total_hours: float = 0
    unique_clients: int = 0
    unique_workers: int = 0
    unique_cases: int = 0
    unique_working_days: int = 0
    unique_sponsors: int = 0
    unique_account_managers: int = 0
    unique_weeks: int = 0
    average_hours_per_entry: float = 0
    std_dev_hours_per_entry: float = 0
    average_hours_per_day: float = 0
    std_dev_hours_per_day: float = 0
    average_hours_per_worker: float = 0
    std_dev_hours_per_worker: float = 0
    average_hours_per_client: float = 0
    std_dev_hours_per_client: float = 0
    average_hours_per_case: float = 0
    std_dev_hours_per_case: float = 0
    average_hours_per_sponsor: float = 0
    std_dev_hours_per_sponsor: float = 0
    average_hours_per_account_manager: float = 0
    std_dev_hours_per_account_manager: float = 0
    average_hours_per_week: float = 0
    std_dev_hours_per_week: float
    total_squad_hours: float = 0
    total_consulting_hours: float = 0
    total_internal_hours: float = 0
    total_hands_on_hours: float = 0
    weekly_hours: List[WeeklyHours] = []

class GroupSummary(TimesheetSummary):
    by_kind: Optional[Dict[str, TimesheetSummary]] = None
    by_week: Optional[List["WeekTimesheetSummary"]] = Field(None, description="List of week summaries")
    by_worker: Optional[List["NamedTimesheetSummary"]] = Field(None, description="List of worker summaries")

    class Config:
        arbitrary_types_allowed = True

class NamedTimesheetSummary(GroupSummary):
    name: str = Field(..., description="Name field for group summaries")

class TitledTimesheetSummary(GroupSummary):
    title: str = Field(..., description="Title field for case summaries")
    case_details: Optional[Dict[str, Any]] = None
    workers: Optional[List[str]] = None
    workers_by_tracking_project: Optional[List[Dict[str, Any]]] = None

class DateTimesheetSummary(GroupSummary):
    date: datetime = Field(..., description="Date field for date summaries")

class WeekTimesheetSummary(GroupSummary):
    week: str = Field(..., description="Week field for week summaries")

class Timesheet(BaseModel):
    summary: TimesheetSummary
    business_calendar: Optional[BusinessCalendar] = None
    by_kind: Optional[Dict[str, TimesheetSummary]] = None
    by_worker: Optional[List[NamedTimesheetSummary]] = None
    by_client: Optional[List[NamedTimesheetSummary]] = None
    by_case: Optional[List[TitledTimesheetSummary]] = None
    by_sponsor: Optional[List[NamedTimesheetSummary]] = None
    by_account_manager: Optional[List[NamedTimesheetSummary]] = None
    by_date: Optional[List[DateTimesheetSummary]] = None
    by_week: Optional[List[WeekTimesheetSummary]] = None
    by_offer: Optional[List[NamedTimesheetSummary]] = None
    appointments: Optional[List[TimesheetAppointment]] = None

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
    total_hours = df["TimeInHs"].sum()
    average_hours_per_entry = total_hours / len(df) if len(df) > 0 else 0

    weekly_summary = group_operations['week'].sum().reset_index()
    weeks = []
    for _, row in weekly_summary.iterrows():
        weeks.append(WeeklyHours(
            week=row['Week'],
            hours=row['TimeInHs']
        ))

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
        std_dev_hours_per_entry=df["TimeInHs"].std(),
        average_hours_per_day=group_results["date"]['mean'],
        std_dev_hours_per_day=group_results["date"]['std'],
        average_hours_per_worker=group_results["worker"]['mean'],
        std_dev_hours_per_worker=group_results["worker"]['std'],
        average_hours_per_client=group_results["client"]['mean'],
        std_dev_hours_per_client=group_results["client"]['std'],
        average_hours_per_case=group_results["case"]['mean'],
        std_dev_hours_per_case=group_results["case"]['std'],
        average_hours_per_sponsor=group_results["sponsor"]['mean'],
        std_dev_hours_per_sponsor=group_results["sponsor"]['std'],
        average_hours_per_account_manager=group_results["account_manager"]['mean'],
        std_dev_hours_per_account_manager=group_results["account_manager"]['std'],
        average_hours_per_week=group_results["week"]['mean'],
        std_dev_hours_per_week=group_results["week"]['std'],
        total_squad_hours=df[df['Kind'] == 'Squad']['TimeInHs'].sum(),
        total_consulting_hours=df[df['Kind'] == 'Consulting']['TimeInHs'].sum(),
        total_internal_hours=df[df['Kind'] == 'Internal']['TimeInHs'].sum(),
        total_hands_on_hours=df[df['Kind'] == 'HandsOn']['TimeInHs'].sum(),
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
    summary_class: type = GroupSummary,
    map: Dict = None
) -> List[GroupSummary]:
    if len(df) == 0:
        return []

    summaries = []
    for group_value, group_df in df.groupby(group_column):
        summary = summary_class(**summarize(group_df).dict())
        setattr(summary, name_key, group_value)

        for kind in ['Squad', 'Consulting', 'Internal', 'HandsOn']:
            kind_hours = group_df[group_df['Kind'] == kind]['TimeInHs'].sum()
            setattr(summary, f"total_{kind.lower()}_hours", kind_hours)

        if map and 'byKind' in map:
            summary.by_kind = summarize_by_kind(group_df, map['byKind'])
        
        if group_column != 'Week' and map and 'byWeek' in map:
            summary.by_week = summarize_by_week(group_df, map['byWeek'])

        if group_column == 'CaseTitle' and 'caseDetails' in map:
            from domain.cases import build_case_dictionary
            
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

def compute_timesheet(map, slug: str=None, kind: str="ALL", filters = None) -> Timesheet:
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
    
    response_dict = {}
    
    # Check if any field other than the specific summary fields is requested
    base_fields = set(requested_fields) - {
        'byKind', 'byWorker', 'byClient', 'byCase', 'bySponsor', 
        'byAccountManager', 'byDate', 'byWeek', 'byOffer'
    }
    
    # Base summary
    if base_fields:
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
                appointment_dict = {}
                for field in fields:
                    field_slug = fields_slugs[field]
                    appointment_dict[field_slug] = row[field]
                appointments.append(TimesheetAppointment(**appointment_dict))
            return appointments
        
        response_dict['appointments'] = summarize_appointments(df, globals.omni_datasets.timesheets.get_all_fields())

    return Timesheet(**response_dict)

def resolve_timesheet(_, info, slug: str, kind: str = "ALL", filters = None):
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, kind, filters)
    return result.dict()

