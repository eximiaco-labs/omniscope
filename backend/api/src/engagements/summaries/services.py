from datetime import datetime, timedelta
from omni_shared import globals
import holidays

def compute_staleliness(worker_slug: str = None):
    from .models import Staleliness, StalelinessCaseInfo
    from team.models import ConsultantOrEngineer
    
    cases = globals.omni_models.cases.get_all().values()
    cases = [case for case in cases if case.is_active]
    
    timesheet = globals.omni_datasets.get_by_slug('timesheet-last-six-weeks')
    timesheet_df = timesheet.data
    
    result = {
        'stale_cases': [],
        'stale_in_one_week_cases': [], 
        'stale_in_less_than_15_days_cases': [],
        'no_description_cases': [],
        'up_to_date_cases': []
    }

    now = datetime.now().date()
        
    for case in cases:
        case_dict = StalelinessCaseInfo(
            title=case.title,
            slug=case.slug,
            last_updated=case.last_updated,
            days_since_update=0,
            consultants_or_engineers=[]
        )
            
        # Get workers from timesheet
        workers_set = set()
        if timesheet_df is not None:
            case_timesheet = timesheet_df[timesheet_df['CaseTitle'] == case.title]
            #workers = case_timesheet[['WorkerName', 'WorkerSlug']].drop_duplicates()
            
            # case_dict.consultants_or_engineers = [
            #     ConsultantOrEngineer.from_domain(
            #         globals.omni_models.workers.get_by_slug(row['WorkerSlug'])
            #     )
            #     for _, row in workers.iterrows()
            # ]
            
            workers = case_timesheet['WorkerSlug'].drop_duplicates()
            workers_set.update(workers)
        # Skip if workerSlug is provided and worker is not in case
        if worker_slug and worker_slug not in workers_set:
            continue
            
        days_since_update = None
        days_since_start = None
        
        if case.last_updated:
            days_since_update = (now - case.last_updated.date()).days
            case_dict.days_since_update = days_since_update
            
        if case.start_of_contract:
            days_since_start = (now - case.start_of_contract).days
        
        # New case (less than 30 days) without updates is considered up to date
        if days_since_start is not None and days_since_start < 30 and not case.last_updated:
            result['up_to_date_cases'].append(case_dict)
        # No description cases
        elif not case.has_description:
            result['no_description_cases'].append(case_dict)
        # Stale cases (more than 30 days)
        elif days_since_update and days_since_update > 30:
            result['stale_cases'].append(case_dict)
        # Will be stale in one week (21-30 days)
        elif days_since_update and days_since_update >= 21:
            result['stale_in_one_week_cases'].append(case_dict)
        # Will be stale in 15 days (15-20 days)
        elif days_since_update and days_since_update >= 15:
            result['stale_in_less_than_15_days_cases'].append(case_dict)
        # Up to date cases
        else:
            result['up_to_date_cases'].append(case_dict)
            
    return Staleliness(**result)

def compute_allocation(start_date=None, end_date=None, filters=None):
    from .models import Allocation, AllocationByKind, DailyAllocation
    
    # Process dates
    def parse_date(date_input):
        if date_input is None:
            return datetime.now()
        if isinstance(date_input, str):
            return datetime.strptime(date_input, '%Y-%m-%d')
        return date_input

    start_date = parse_date(start_date)
    end_date = parse_date(end_date)

    # Get and filter timesheet data
    timesheet = globals.omni_datasets.timesheets.get(start_date, end_date)
    df, result = globals.omni_datasets.apply_filters(
        globals.omni_datasets.timesheets,
        timesheet.data,
        filters
    )

    # Define kind mappings
    kind_map = {
        'Consulting': 'consulting',
        'Internal': 'internal',
        'HandsOn': 'hands_on', 
        'Squad': 'squad'
    }

    # Initialize structure with empty lists for each kind
    by_kind = {normalized: [] for normalized in kind_map.values()}

    # Process allocations in one pass
    daily_allocation = df.groupby(['Date', 'Kind'])['TimeInHs'].sum()
    
    for (date, kind), hours in daily_allocation.items():
        if normalized_kind := kind_map.get(kind):
            by_kind[normalized_kind].append(
                DailyAllocation(
                    date=date.strftime('%Y-%m-%d'),
                    hours=float(hours)
                )
            )

    return Allocation(
        by_kind=AllocationByKind(**by_kind),
        filterable_fields=result['filterable_fields']
    )


def compute_business_calendar(start, end):
    from .models import BusinessCalendar, Holiday
    
    if isinstance(start, str):
        start = datetime.strptime(start, '%Y-%m-%d').date()
    if isinstance(end, str):
        end = datetime.strptime(end, '%Y-%m-%d').date()
        
    br_holidays = holidays.BR()
    
    working_days = []
    current = start
    while current <= end:
        if current not in br_holidays and current.weekday() < 5:
            working_days.append(current)
        current += timedelta(days=1)
    
    holidays_in_range = []
    current = start 
    while current <= end:
        if current in br_holidays:
            holidays_in_range.append(
                Holiday(
                    date=current,
                    reason=br_holidays.get(current)
                )
            )
        current += timedelta(days=1)
    
    return BusinessCalendar(
        working_days=working_days,
        holidays=holidays_in_range
    )