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
class OneWeekRegularCaseRevenueSummary:
    id: str
    title: str
    sponsor: str
    client: str
    account_manager: str
    approved_work_hours: float
    actual_work_hours: float
    wasted_hours: float

@dataclass
class OneWeekPreContractedCaseRevenueSummary:
    id: str
    title: str
    sponsor: str
    client: str
    account_manager: str
    approved_work_hours: float
    actual_work_hours: float
    possible_unpaid_hours: float
    possible_idle_hours: float

@dataclass
class TotalsRegular:
    approved_work_hours: float
    actual_work_hours: float
    wasted_hours: float
    
@dataclass
class TotalsPreContracted:
    approved_work_hours: float
    actual_work_hours: float
    possible_unpaid_hours: float
    possible_idle_hours: float
    
@dataclass
class Totals:
    regular: TotalsRegular
    pre_contracted: TotalsPreContracted

@dataclass
class EntityRevenueSummary:
    name: str
    account_manager: Optional[str] = None
    totals: Totals = None

@dataclass
class WeekRevenueAnalysis:
    start: datetime
    end: datetime
    regular_cases: List[OneWeekRegularCaseRevenueSummary]
    pre_contracted_cases: List[OneWeekPreContractedCaseRevenueSummary]
    clients: List[EntityRevenueSummary]
    sponsors: List[EntityRevenueSummary]
    account_managers: List[EntityRevenueSummary]
    totals: Totals
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

    def calculate_case_metrics(case, actual_hours: float):
        client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
        account_manager = client.account_manager.name if client and client.account_manager else 'N/A'
        weekly_approved_hours = case.weekly_approved_hours if case.weekly_approved_hours else 0
        
        if case.pre_contracted_value:
            possible_unpaid_hours = max(0, actual_hours - weekly_approved_hours)
            possible_idle_hours = abs(min(0, actual_hours - weekly_approved_hours))
            return OneWeekPreContractedCaseRevenueSummary(
                id=case.id,
                title=case.title,
                sponsor=case.sponsor if case.sponsor else 'N/A',
                client=client.name if client else 'N/A',
                account_manager=account_manager,
                approved_work_hours=weekly_approved_hours,
                actual_work_hours=actual_hours,
                possible_unpaid_hours=possible_unpaid_hours,
                possible_idle_hours=possible_idle_hours
            )
        else:
            wasted_hours = max(0, weekly_approved_hours - actual_hours)
            return OneWeekRegularCaseRevenueSummary(
                id=case.id,
                title=case.title,
                sponsor=case.sponsor if case.sponsor else 'N/A',
                client=client.name if client else 'N/A',
                account_manager=account_manager,
                approved_work_hours=weekly_approved_hours,
                actual_work_hours=actual_hours,
                wasted_hours=wasted_hours
            )

    def calculate_entity_summary(regular_cases: List[OneWeekRegularCaseRevenueSummary], 
                               pre_contracted_cases: List[OneWeekPreContractedCaseRevenueSummary], 
                               filter_fn) -> List[EntityRevenueSummary]:
        entities = {filter_fn(case) for case in regular_cases + pre_contracted_cases}
        summaries = []
        
        for entity in entities:
            reg_cases = [case for case in regular_cases if filter_fn(case) == entity]
            pre_cases = [case for case in pre_contracted_cases if filter_fn(case) == entity]
            
            regular = TotalsRegular(
                approved_work_hours=sum(case.approved_work_hours for case in reg_cases),
                actual_work_hours=sum(case.actual_work_hours for case in reg_cases),
                wasted_hours=sum(case.wasted_hours for case in reg_cases)
            )
            
            pre_contracted = TotalsPreContracted(
                approved_work_hours=sum(case.approved_work_hours for case in pre_cases),
                actual_work_hours=sum(case.actual_work_hours for case in pre_cases),
                possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_cases),
                possible_idle_hours=sum(case.possible_idle_hours for case in pre_cases)
            )
            
            summary = EntityRevenueSummary(
                name=entity,
                account_manager=next((case.account_manager for case in (reg_cases + pre_cases)), 'N/A'),
                totals=Totals(regular=regular, pre_contracted=pre_contracted)
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
            
        case_summaries = [calculate_case_metrics(case, by_case_hours.get(case.id, 0)) 
                         for case in cases
                         if (case.weekly_approved_hours and case.weekly_approved_hours > 0) or
                            (by_case_hours.get(case.id, 0) > 0)]
        
        regular_cases = [case for case in case_summaries if isinstance(case, OneWeekRegularCaseRevenueSummary)]
        pre_contracted_cases = [case for case in case_summaries if isinstance(case, OneWeekPreContractedCaseRevenueSummary)]
        
        clients_ = calculate_entity_summary(regular_cases, pre_contracted_cases, lambda x: x.client)
        account_managers_ = calculate_entity_summary(regular_cases, pre_contracted_cases, lambda x: x.account_manager)
        sponsors_ = calculate_entity_summary(regular_cases, pre_contracted_cases, lambda x: x.sponsor)
        
        regular = TotalsRegular(
            approved_work_hours=sum(case.weekly_approved_hours for case in cases if not case.pre_contracted_value and case.weekly_approved_hours),
            actual_work_hours=sum(day.regular_work_hours for day in actual_work_hours),
            wasted_hours=sum(case.wasted_hours for case in regular_cases)
        )
        
        pre_contracted = TotalsPreContracted(
            approved_work_hours=sum(case.weekly_approved_hours for case in cases if case.pre_contracted_value and case.weekly_approved_hours),
            actual_work_hours=sum(day.pre_contracted_work_hours for day in actual_work_hours),
            possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_contracted_cases),
            possible_idle_hours=sum(case.possible_idle_hours for case in pre_contracted_cases)
        )
        
        week = WeekRevenueAnalysis(
            start=s,
            end=e,
            regular_cases=regular_cases,
            pre_contracted_cases=pre_contracted_cases,
            clients=clients_,
            sponsors=sponsors_,
            account_managers=account_managers_,
            totals=Totals(regular=regular, pre_contracted=pre_contracted),
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