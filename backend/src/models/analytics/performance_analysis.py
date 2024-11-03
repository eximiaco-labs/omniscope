from datetime import datetime, date
import pandas as pd
import calendar
from typing import List, Dict, Optional
from dataclasses import dataclass
import globals

from models.helpers.weeks import Weeks

@dataclass
class CaseHours:
    case_id: str
    hours: float
    pre_contracted: bool

@dataclass 
class WorkingDayHours:
    date: date
    hours: float
    pre_contracted_work_hours: float
    regular_work_hours: float
    by_case: List[CaseHours]

@dataclass
class OneWeekCaseRevenueSummary:
    id: str
    title: str
    sponsor: str
    client: str
    account_manager: str
    approved_work_hours: float
    actual_work_hours: float
    is_pre_contracted: bool
    possible_unpaid_hours: float
    possible_idle_hours: float
    wasted_hours: float

@dataclass
class EntityRevenueSummary:
    name: str
    account_manager: Optional[str] = None
    total_approved_work_hours: float = 0
    total_actual_work_hours: float = 0
    total_pre_contracted_approved_work_hours: float = 0
    total_regular_approved_work_hours: float = 0
    total_pre_contracted_actual_work_hours: float = 0
    total_regular_actual_work_hours: float = 0
    total_wasted_hours: float = 0
    total_possible_unpaid_hours: float = 0
    total_possible_idle_hours: float = 0

@dataclass
class WeekRevenueAnalysis:
    start: datetime
    end: datetime
    cases: List[OneWeekCaseRevenueSummary]
    clients: List[EntityRevenueSummary]
    sponsors: List[EntityRevenueSummary]
    account_managers: List[EntityRevenueSummary]
    total_approved_work_hours: float
    total_pre_contracted_approved_work_hours: float
    total_regular_approved_work_hours: float
    total_actual_work_hours: float
    total_pre_contracted_actual_work_hours: float
    total_regular_actual_work_hours: float
    total_possible_unpaid_hours: float
    total_possible_idle_hours: float
    total_possible_wasted_hours: float
    actual_work_hours: List[WorkingDayHours]
    
@dataclass
class PerformanceAnalysis:
    start: date
    end: date
    date_of_interest: date
    weeks: List[WeekRevenueAnalysis]


def compute_performance_analysis(date_of_interest: str | date) -> PerformanceAnalysis:
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.fromisoformat(date_of_interest).date()

    start = date_of_interest.replace(day=1)
    _, last_day = calendar.monthrange(date_of_interest.year, date_of_interest.month)
    end = date_of_interest.replace(day=last_day)
    
    weeks = []

    s, _ = Weeks.get_week_dates(start)
    _, e = Weeks.get_week_dates(end)
    
    source_timesheet = globals.omni_datasets.timesheets.get(s, e).data
    timesheet = source_timesheet[source_timesheet['Kind'] == 'Consulting']
    # timesheet = source_timesheet[source_timesheet['Date'] >= start]
    
    sw = start
    all_cases = globals.omni_models.cases.get_all().values()

    def is_case_active(case, s, e):
        if not case.start_of_contract and not case.end_of_contract:
            return case.is_active
        
        return (
            ((not case.start_of_contract) or case.start_of_contract <= e.date()) and 
            ((not case.end_of_contract) or case.end_of_contract >= s.date())
        )

    def get_case_hours_for_day(day_timesheet) -> tuple[List[CaseHours], Dict[str, float]]:
        by_case = []
        by_case_hours = {}
        
        for case_id, hours in day_timesheet.groupby('CaseId')['TimeInHs'].sum().items():
            case = globals.omni_models.cases.get_by_id(case_id)
            pre_contracted = case.pre_contracted_value if case else False
            
            by_case.append(CaseHours(case_id, hours, pre_contracted))
            by_case_hours[case_id] = by_case_hours.get(case_id, 0) + hours
            
        return by_case, by_case_hours

    def calculate_case_metrics(case, actual_hours: float) -> OneWeekCaseRevenueSummary:
        client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
        account_manager = client.account_manager.name if client and client.account_manager else 'N/A'
        
        weekly_approved_hours = case.weekly_approved_hours if case.weekly_approved_hours else 0
        possible_unpaid_hours = max(0, actual_hours - weekly_approved_hours) if case.pre_contracted_value else 0
        possible_idle_hours = abs(min(0, actual_hours - weekly_approved_hours)) if case.pre_contracted_value else 0
        wasted_hours = max(0, weekly_approved_hours - actual_hours) if not case.pre_contracted_value else 0
        
        return OneWeekCaseRevenueSummary(
            id=case.id,
            title=case.title,
            sponsor=case.sponsor if case.sponsor else 'N/A',
            client=client.name if client else 'N/A',
            account_manager=account_manager,
            approved_work_hours=case.weekly_approved_hours if case.weekly_approved_hours else 0,
            actual_work_hours=actual_hours,
            is_pre_contracted=case.pre_contracted_value,
            possible_unpaid_hours=possible_unpaid_hours,
            possible_idle_hours=possible_idle_hours,
            wasted_hours=wasted_hours
        )

    def calculate_entity_summary(cases: List[OneWeekCaseRevenueSummary], filter_fn) -> List[EntityRevenueSummary]:
        summaries = []
        for entity in {filter_fn(case) for case in cases}:
            entity_cases = [case for case in cases if filter_fn(case) == entity]
            
            summary = EntityRevenueSummary(
                name=entity,
                account_manager=next((case.account_manager for case in entity_cases), 'N/A'),
                total_approved_work_hours=sum(case.approved_work_hours for case in entity_cases),
                total_actual_work_hours=sum(case.actual_work_hours for case in entity_cases),
                total_pre_contracted_approved_work_hours=sum(case.approved_work_hours for case in entity_cases if case.is_pre_contracted),
                total_regular_approved_work_hours=sum(case.approved_work_hours for case in entity_cases if not case.is_pre_contracted),
                total_pre_contracted_actual_work_hours=sum(case.actual_work_hours for case in entity_cases if case.is_pre_contracted),
                total_regular_actual_work_hours=sum(case.actual_work_hours for case in entity_cases if not case.is_pre_contracted),
                total_wasted_hours=sum(case.wasted_hours for case in entity_cases),
                total_possible_unpaid_hours=sum(case.possible_unpaid_hours for case in entity_cases),
                total_possible_idle_hours=sum(case.possible_idle_hours for case in entity_cases)
            )
            summaries.append(summary)
            
        return summaries

    while sw <= end:
        s, e = Weeks.get_week_dates(sw)
        cases = [case for case in all_cases if is_case_active(case, s, e)]
        
        actual_work_hours = []
        by_case_hours = {}
        current_date = s.date()
        
        while current_date <= min(e.date(), end):
            day_timesheet = timesheet[pd.to_datetime(timesheet['Date']).dt.date == current_date]
            by_case, case_hours = get_case_hours_for_day(day_timesheet)
            by_case_hours.update(case_hours)
            
            day_hours = WorkingDayHours(
                date=current_date,
                hours=day_timesheet['TimeInHs'].sum(),
                pre_contracted_work_hours=sum(case.hours for case in by_case if case.pre_contracted),
                regular_work_hours=sum(case.hours for case in by_case if not case.pre_contracted),
                by_case=by_case
            )
            actual_work_hours.append(day_hours)
            current_date += pd.Timedelta(days=1)
            
        cases_ = [calculate_case_metrics(case, by_case_hours.get(case.id, 0)) for case in cases]
        
        clients_ = calculate_entity_summary(cases_, lambda x: x.client)
        account_managers_ = calculate_entity_summary(cases_, lambda x: x.account_manager)
        sponsors_ = calculate_entity_summary(cases_, lambda x: x.sponsor)
        
        week = WeekRevenueAnalysis(
            start=s,
            end=e,
            cases=cases_,
            clients=clients_,
            sponsors=sponsors_,
            account_managers=account_managers_,
            total_approved_work_hours=sum(case.weekly_approved_hours for case in cases if case.weekly_approved_hours),
            total_pre_contracted_approved_work_hours=sum(case.weekly_approved_hours for case in cases if case.pre_contracted_value and case.weekly_approved_hours),
            total_regular_approved_work_hours=sum(case.weekly_approved_hours for case in cases if not case.pre_contracted_value and case.weekly_approved_hours),
            total_actual_work_hours=sum(day.hours for day in actual_work_hours),
            total_pre_contracted_actual_work_hours=sum(day.pre_contracted_work_hours for day in actual_work_hours),
            total_regular_actual_work_hours=sum(day.regular_work_hours for day in actual_work_hours),
            total_possible_unpaid_hours=sum(case.possible_unpaid_hours for case in cases_),
            total_possible_idle_hours=sum(case.possible_idle_hours for case in cases_),
            total_possible_wasted_hours=sum(case.wasted_hours for case in cases_),
            actual_work_hours=actual_work_hours
        )
        
        weeks.append(week)
        sw += pd.Timedelta(days=7)
            
    return PerformanceAnalysis(
        start=start,
        end=end,
        date_of_interest=date_of_interest,
        weeks=weeks
    )