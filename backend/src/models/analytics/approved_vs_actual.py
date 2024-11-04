from typing import Dict, List, Any
import pandas as pd
from datetime import datetime, date
from models.helpers.weeks import Weeks
import globals
from dataclasses import dataclass

@dataclass
class WeekData:
    title: str
    start: date
    end: date
    number_of_days: int
    approved_hours: float
    actual_hours: float
    difference: float

@dataclass 
class CaseData:
    id: str
    title: str
    start_of_contract: str | None
    end_of_contract: str | None
    weekly_approved_hours: float
    pre_contracted_value: float
    weeks: List[WeekData]
    total_approved_hours: float = 0
    total_actual_hours: float = 0
    total_difference: float = 0

@dataclass
class ApprovedVsActualResult:
    start: str
    end: str
    total_approved_hours: float
    total_actual_hours: float
    total_difference: float
    number_of_cases: int
    cases: List[CaseData]

def compute_approved_vs_actual(start: str | datetime, end: str | datetime) -> ApprovedVsActualResult:
    raw_data = _compute_raw_data(start, end)
    unique_cases = _process_raw_data(raw_data)
    all_cases = _prepare_cases_data(unique_cases)
    
    return _create_result_summary(raw_data, all_cases)

def _process_raw_data(raw_data: Dict[str, Any]) -> Dict[str, CaseData]:
    unique_cases = {}
    for week in raw_data['weeks']:
        for case in week['data']:
            case_id = case['id']
            if case_id not in unique_cases:
                unique_cases[case_id] = _initialize_case(case)
            unique_cases[case_id].weeks.append(_create_week_data(week, case))
    return unique_cases

def _initialize_case(case: Dict[str, Any]) -> CaseData:
    return CaseData(
        id=case['id'],
        title=case['title'],
        start_of_contract=case['start_of_contract'],
        end_of_contract=case['end_of_contract'],
        weekly_approved_hours=case['weekly_approved_hours'],
        pre_contracted_value=case['pre_contracted_value'],
        weeks=[]
    )

def _create_week_data(week: Dict[str, Any], case: Dict[str, Any]) -> WeekData:
    return WeekData(
        title=week['title'],
        start=datetime.fromisoformat(week['start']).date(),
        end=datetime.fromisoformat(week['end']).date(),
        number_of_days=case['number_of_days'],
        approved_hours=case['approved_hours'],
        actual_hours=case['actual'],
        difference=case['actual'] - case['approved_hours']
    )

def _prepare_cases_data(unique_cases: Dict[str, CaseData]) -> List[CaseData]:
    all_cases = list(unique_cases.values())
    for case in all_cases:
        # Calculate sums for approved_hours, actual, and difference
        case.total_approved_hours = sum(week.approved_hours for week in case.weeks)
        case.total_actual_hours = sum(week.actual_hours for week in case.weeks)
        case.total_difference = sum(week.difference for week in case.weeks)

    # Sort the list of cases by total difference in descending order
    all_cases.sort(key=lambda x: x.total_difference)

    # Filter out cases that are not active or have no actual hours
    all_cases = [
        case
        for case in all_cases
        if globals.omni_models.cases.get_by_id(case.id).is_active or case.total_actual_hours > 0
    ]

    return all_cases

def _create_result_summary(raw_data: Dict[str, Any], all_cases: List[CaseData]) -> ApprovedVsActualResult:
    return ApprovedVsActualResult(
        start=raw_data['start'],
        end=raw_data['end'],
        total_approved_hours=sum(case.total_approved_hours for case in all_cases),
        total_actual_hours=sum(case.total_actual_hours for case in all_cases),
        total_difference=sum(case.total_difference for case in all_cases),
        number_of_cases=len(all_cases),
        cases=all_cases
    )

def _compute_raw_data(start, end):
    if isinstance(start, str):
        start = datetime.fromisoformat(start)

    if isinstance(end, str):
        end = datetime.fromisoformat(end)

    s, ew = Weeks.get_week_dates(start)
    _, e = Weeks.get_week_dates(end)

    result = {
        'start': s.isoformat(),
        'end': e.isoformat(),
        'weeks': []
    }

    while s < e:
        timesheet = _summarize_consulting_timesheet(s, ew)
        df = _list_cases_with_approved_hours_and_actual(s, ew, timesheet)

        df['start_of_week'] = df['start_of_contract'].apply(lambda x: max(s, x) if pd.notna(x) else s)
        df['end_of_week'] = df['end_of_contract'].apply(lambda x: min(ew, x) if pd.notna(x) else ew)
        df['number_of_days'] = (df['end_of_week'] - df['start_of_week']).dt.days + 1
        df['approved_hours'] = df['weekly_approved_hours'] * df['number_of_days'] / 7

        df['start_of_contract'] = df['start_of_contract'].apply(lambda x: None if pd.isna(x) or x is pd.NaT else x)
        df['end_of_contract'] = df['end_of_contract'].apply(lambda x: None if pd.isna(x) or x is pd.NaT else x)

        # Convert datetime columns to ISO format strings
        df['start_of_week'] = df['start_of_week'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['end_of_week'] = df['end_of_week'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['start_of_contract'] = df['start_of_contract'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['end_of_contract'] = df['end_of_contract'].apply(lambda x: x.isoformat() if pd.notna(x) else None)

        week_data = df.to_dict(orient='records')

        result['weeks'].append(
            {
                'start': s.isoformat(),
                'end': ew.isoformat(),
                'title': Weeks.get_week_string(s),
                'data': week_data
            }
        )

        s = ew + pd.Timedelta(days=1)
        s, ew = Weeks.get_week_dates(s)

    return result

def _list_cases_with_approved_hours_and_actual(start_date, end_date, consulting_timesheet_summary):
    cases = globals.omni_models.cases.get_live_cases_with_approved_hours(start_date, end_date)

    df = pd.DataFrame(
        [{
            'client_id': case.client_id,
            'id': case.id,
            'title': case.title,
            'start_of_contract': case.start_of_contract,
            'end_of_contract': case.end_of_contract,
            'weekly_approved_hours': case.weekly_approved_hours,
            'is_active': case.is_active,
            'pre_contracted_value': case.pre_contracted_value
        } for case in cases]
    )

    df['start_of_contract'] = pd.to_datetime(df['start_of_contract'])
    df['end_of_contract'] = pd.to_datetime(df['end_of_contract'])

    if consulting_timesheet_summary is not None and not consulting_timesheet_summary.empty:
        df = pd.merge(df, consulting_timesheet_summary, on='id', how='left')
        df['actual'] = df['actual'].fillna(0)
    else:
        df['actual'] = 0

    return df

def _summarize_consulting_timesheet(start, end):
    timesheet = globals.omni_datasets.timesheets.get(start, end)
    timesheet_df = timesheet.data
    if not timesheet_df.empty:
        timesheet_df = timesheet_df[timesheet_df['Kind'] == 'Consulting']

    if timesheet_df.empty:
        return pd.DataFrame()

    summary = timesheet_df.groupby(['CaseId'])['TimeInHs'].sum().reset_index()
    return summary.rename(
        columns={
            'CaseId': 'id',
            'TimeInHs': 'actual'
        }
    )
