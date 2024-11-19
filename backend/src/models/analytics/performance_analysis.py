from datetime import datetime, date
import pandas as pd
import calendar
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
from models.domain.cases import Case

import globals

from models.helpers.weeks import Weeks

@dataclass
class CaseHours:
    case_id: str
    hours: float
    pre_contracted: bool
    
    @staticmethod
    def new(case_id: str, hours: float) -> 'CaseHours':
        case = globals.omni_models.cases.get_by_id(case_id)
        pre_contracted = case.pre_contracted_value if case else False
        return CaseHours(case_id, hours, pre_contracted)

@dataclass 
class WorkingDayHours:
    date: date
    hours: float
    pre_contracted_work_hours: float
    regular_work_hours: float
    by_case: List[CaseHours]
    
    @staticmethod
    def from_timesheet(timesheet: pd.DataFrame, day_of_interest) -> 'WorkingDayHours':
        timesheet = timesheet[pd.to_datetime(timesheet['Date']).dt.date == day_of_interest.date()]
        by_case = [
            CaseHours.new(case_id, hours)
            for case_id, hours in timesheet.groupby('CaseId')['TimeInHs'].sum().items()
        ]
        
        return WorkingDayHours(
            date=day_of_interest,
            hours=timesheet['TimeInHs'].sum(),
            pre_contracted_work_hours=sum(case.hours for case in by_case if case.pre_contracted),
            regular_work_hours=sum(case.hours for case in by_case if not case.pre_contracted),
            by_case=by_case
        )
        
@dataclass
class WeekWorkingHours:
    start: date
    end: date
    working_days: List[WorkingDayHours]
    
    _by_case: Dict[str, float] = None
     
    @property
    def by_case(self) -> Dict[str, float]:
        if self._by_case is None:
            self._by_case = {}
            for day in self.working_days:
                for case in day.by_case:
                    self._by_case[case.case_id] = self._by_case.get(case.case_id, 0) + case.hours                    
        return self._by_case
    
    def this_month(self, month: int) -> List[WorkingDayHours]:
        if self.start.month != month and self.end.month != month:
            return None;
        
        if self.start.month == month:
            start = self.start
        else:
            start = self.end.replace(day=1)
        
        if self.end.month == month:
            end = self.end
        else:
            _, last_day = calendar.monthrange(self.start.year, month)
            end = self.start.replace(day=last_day)
        
        return WeekWorkingHours(start, end, [
            day 
            for day in self.working_days 
            if day.date.month == month
        ])
        
    
    @staticmethod
    def from_timesheet(timesheet: pd.DataFrame, start: date, end: date) -> 'WeekWorkingHours':
        working_days = [
            WorkingDayHours.from_timesheet(timesheet, day_of_interest)
            for day_of_interest in pd.date_range(start, end)
        ]
        return WeekWorkingHours(start, end, working_days)
    
@dataclass
class OneWeekRegularCasePerformanceSummary:
    id: str
    title: str
    sponsor: str
    client: str
    account_manager: str
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    wasted_hours: float
    over_approved_hours: float

@dataclass
class OneWeekPreContractedCasePerformanceSummary:
    id: str
    title: str
    sponsor: str
    client: str
    account_manager: str
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    possible_unpaid_hours: float
    possible_idle_hours: float
    
class OneWeekPerformanceSummary:
    def __init__(self, week: WeekWorkingHours):
        self.week = week
        
    @property
    def start(self) -> date:
        return self.week.start
    
    @property
    def end(self) -> date:
        return self.week.end
    
    def filter_cases(self, cases: List[Case]) -> List[Case]:
        def is_eligible_case(case: Case) -> bool:
            return (
                case.is_active and
                case.weekly_approved_hours and 
                case.weekly_approved_hours > 0 and 
                case.has_contract_in_period(self.start, self.end) 
            ) or (
                self.week.by_case.get(case.id, 0) > 0
            )
        
        return [
            case 
            for case in cases 
            if is_eligible_case(case)
        ]
    
    def build_case_summary(self, case: Case, this_month: int) -> OneWeekRegularCasePerformanceSummary | OneWeekPreContractedCasePerformanceSummary:
        client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
        
        actual_hours = self.week.by_case.get(case.id, 0)
        this_month_hours = self.week.this_month(this_month).by_case.get(case.id, 0)

        id = case.id
        title = case.title
        sponsor_name = case.sponsor if case.sponsor else 'N/A'
        client_name = client.name if client else 'N/A'
        account_manager_name = client.account_manager.name if client and client.account_manager else 'N/A'
        weekly_approved_hours = case.weekly_approved_hours if case.weekly_approved_hours else 0
        
        if case.pre_contracted_value:
            possible_unpaid_hours = max(0, actual_hours - weekly_approved_hours)
            possible_idle_hours = abs(min(0, actual_hours - weekly_approved_hours))
            return OneWeekPreContractedCasePerformanceSummary(
                id=id,
                title=title,
                sponsor=sponsor_name,
                client=client_name,
                account_manager=account_manager_name,
                approved_work_hours=weekly_approved_hours,
                actual_work_hours=actual_hours,
                in_context_actual_work_hours=this_month_hours,
                possible_unpaid_hours=possible_unpaid_hours,
                possible_idle_hours=possible_idle_hours
            )
        else:
            wasted_hours = max(0, weekly_approved_hours - actual_hours)
            over_approved_hours = max(0, actual_hours - weekly_approved_hours)
            return OneWeekRegularCasePerformanceSummary(
                id=id,
                title=title,
                sponsor=sponsor_name,
                client=client_name,
                account_manager=account_manager_name,
                approved_work_hours=weekly_approved_hours,
                actual_work_hours=actual_hours,
                in_context_actual_work_hours=this_month_hours,
                wasted_hours=wasted_hours,
                over_approved_hours=over_approved_hours
            )
        
    def build_cases_summaries(self, cases: List[Case], this_month: int) -> List[OneWeekRegularCasePerformanceSummary | OneWeekPreContractedCasePerformanceSummary]:
        return [
            self.build_case_summary(case, this_month)
            for case in self.filter_cases(cases)
        ]

@dataclass
class TotalsRegular:
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    wasted_hours: float
    over_approved_hours: float
    
    @staticmethod
    def compute_from_cases(cases: List[OneWeekRegularCasePerformanceSummary]) -> 'TotalsRegular':
        return TotalsRegular(
            approved_work_hours=sum(case.approved_work_hours for case in cases),
            actual_work_hours=sum(case.actual_work_hours for case in cases),
            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in cases),
            wasted_hours=sum(case.wasted_hours for case in cases),
            over_approved_hours=sum(case.over_approved_hours for case in cases)
        )
    
@dataclass
class TotalsPreContracted:
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    possible_unpaid_hours: float
    possible_idle_hours: float
    
    @staticmethod
    def compute_from_cases(cases: List[OneWeekPreContractedCasePerformanceSummary]) -> 'TotalsPreContracted':
        return TotalsPreContracted(
            approved_work_hours=sum(case.approved_work_hours for case in cases),
            actual_work_hours=sum(case.actual_work_hours for case in cases),
            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in cases),
            possible_unpaid_hours=sum(case.possible_unpaid_hours for case in cases),
            possible_idle_hours=sum(case.possible_idle_hours for case in cases)
        )
    
@dataclass
class Totals:
    regular: TotalsRegular
    pre_contracted: TotalsPreContracted

@dataclass
class SponsorPerformanceSummary:
    name: str
    totals: Totals
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    
    @staticmethod
    def compute_from_cases(name: str, regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> 'SponsorPerformanceSummary':
        filtered_regular_cases = [case for case in regular_cases if case.sponsor == name]
        filtered_pre_contracted_cases = [case for case in pre_contracted_cases if case.sponsor == name]
        
        regular = TotalsRegular.compute_from_cases(filtered_regular_cases)
        pre_contracted = TotalsPreContracted.compute_from_cases(filtered_pre_contracted_cases)
        
        return SponsorPerformanceSummary(
            name=name,
            totals=Totals(regular=regular, pre_contracted=pre_contracted),
            regular_cases=filtered_regular_cases,
            pre_contracted_cases=filtered_pre_contracted_cases
        )
        
    @staticmethod
    def compute_list_from_cases(regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> List['SponsorPerformanceSummary']:
        sponsors = sorted(set(case.sponsor for case in regular_cases + pre_contracted_cases))

        return [
            SponsorPerformanceSummary.compute_from_cases(sponsor, regular_cases, pre_contracted_cases)
            for sponsor in sponsors
        ]
        
@dataclass
class ClientPerformanceSummary:
    name: str
    totals: Totals
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    sponsors: List[SponsorPerformanceSummary]
    
    @staticmethod
    def compute_from_cases(name: str, regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> 'ClientPerformanceSummary':
        filtered_regular_cases = [case for case in regular_cases if case.client == name]
        filtered_pre_contracted_cases = [case for case in pre_contracted_cases if case.client == name]
        
        regular = TotalsRegular.compute_from_cases(filtered_regular_cases)
        pre_contracted = TotalsPreContracted.compute_from_cases(filtered_pre_contracted_cases)
        
        return ClientPerformanceSummary(
            name=name,
            totals=Totals(regular=regular, pre_contracted=pre_contracted),
            regular_cases=filtered_regular_cases,
            pre_contracted_cases=filtered_pre_contracted_cases,
            sponsors=SponsorPerformanceSummary.compute_list_from_cases(filtered_regular_cases, filtered_pre_contracted_cases)
        )
    
    @staticmethod
    def compute_list_from_cases(regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> List['ClientPerformanceSummary']:
        clients = sorted(set(case.client for case in regular_cases + pre_contracted_cases))
        return [
            ClientPerformanceSummary.compute_from_cases(client, regular_cases, pre_contracted_cases)
            for client in clients
        ]
        

@dataclass
class AccountManagerPerformanceSummary:
    name: str
    totals: Totals
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    clients: List[ClientPerformanceSummary]
    
    @staticmethod
    def compute_from_cases(name: str, regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> 'AccountManagerPerformanceSummary':
        filtered_regular_cases = [case for case in regular_cases if case.account_manager == name]
        filtered_pre_contracted_cases = [case for case in pre_contracted_cases if case.account_manager == name]

        regular = TotalsRegular.compute_from_cases(filtered_regular_cases)
        pre_contracted = TotalsPreContracted.compute_from_cases(filtered_pre_contracted_cases)
        
        return AccountManagerPerformanceSummary(
            name=name,
            totals=Totals(regular=regular, pre_contracted=pre_contracted),
            regular_cases=filtered_regular_cases,
            pre_contracted_cases=filtered_pre_contracted_cases,
            clients=ClientPerformanceSummary.compute_list_from_cases(filtered_regular_cases, filtered_pre_contracted_cases)
        )
    
    @staticmethod
    def compute_list_from_cases(regular_cases: List[OneWeekRegularCasePerformanceSummary], pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]) -> List['AccountManagerPerformanceSummary']:
        account_managers = sorted(set(case.account_manager for case in regular_cases + pre_contracted_cases))
        return [
            AccountManagerPerformanceSummary.compute_from_cases(account_manager, regular_cases, pre_contracted_cases)
            for account_manager in account_managers
        ]

@dataclass
class WeekPerformanceAnalysis:
    start: date
    end: date
    period_type: str
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    clients: List[ClientPerformanceSummary]
    sponsors: List[SponsorPerformanceSummary]
    account_managers: List[AccountManagerPerformanceSummary]
    totals: Totals
    actual_work_hours: List[WorkingDayHours]
    
@dataclass
class PerformanceAnalysis:
    start: date
    end: date
    date_of_interest: date
    weeks: List[WeekPerformanceAnalysis]

def _get_month_dates(date_of_interest: date) -> tuple[date, date]:
    start = date_of_interest.replace(day=1)
    _, last_day = calendar.monthrange(date_of_interest.year, date_of_interest.month)
    end = date_of_interest.replace(day=last_day)
    return start, end

def _get_analysis_period(start: date, end: date) -> tuple[date, date]:
    s, _ = Weeks.get_week_dates(start)
    _, e = Weeks.get_week_dates(end)
    return s, e

def _get_timesheet(start: date, end: date) -> pd.DataFrame:
    source_timesheet = globals.omni_datasets.timesheets.get(start, end).data
    timesheet = source_timesheet[source_timesheet['Kind'] == 'Consulting']
    return timesheet

def _filter_cases_by_period(cases: List[Case], start: date, end: date) -> List[Case]:
    return [
        case 
        for case in cases 
        if case.has_contract_in_period(start, end)
    ]

def compute_performance_analysis(date_of_interest: str | date) -> PerformanceAnalysis:
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.fromisoformat(date_of_interest).date()
        
    start, end = _get_month_dates(date_of_interest)
    s, e = _get_analysis_period(start, end)
    timesheet = _get_timesheet(s, e)
    all_cases = globals.omni_models.cases.get_all().values()

    weeks = []
    
    start_of_week = s
    end_of_analysis = e
    
    while start_of_week <= end_of_analysis:
        _, end_of_week = Weeks.get_week_dates(start_of_week)
        cases = _filter_cases_by_period(all_cases, start_of_week, end_of_week)
       
        week_working_hours = WeekWorkingHours.from_timesheet(timesheet, start_of_week, end_of_week)
        week_performance_summary = OneWeekPerformanceSummary(week_working_hours)

        cases_summaries = week_performance_summary.build_cases_summaries(cases, date_of_interest.month)
        regular_cases_summaries = [case for case in cases_summaries if isinstance(case, OneWeekRegularCasePerformanceSummary)]
        pre_contracted_cases_summaries = [case for case in cases_summaries if isinstance(case, OneWeekPreContractedCasePerformanceSummary)]
        
        regular = TotalsRegular.compute_from_cases(regular_cases_summaries)
        pre_contracted = TotalsPreContracted.compute_from_cases(pre_contracted_cases_summaries)

        period_type = (
            "future" if start_of_week.date() > date_of_interest
            else "past" if end_of_week.date() < date_of_interest
            else "current"
        )
        
        week = WeekPerformanceAnalysis(
            start=start_of_week,
            end=end_of_week,
            period_type=period_type,
            regular_cases=regular_cases_summaries,
            pre_contracted_cases=pre_contracted_cases_summaries,
            clients=ClientPerformanceSummary.compute_list_from_cases(
                regular_cases_summaries, 
                pre_contracted_cases_summaries
                ),
            sponsors=SponsorPerformanceSummary.compute_list_from_cases(
                regular_cases_summaries, 
                pre_contracted_cases_summaries
                ),
            account_managers=AccountManagerPerformanceSummary.compute_list_from_cases(
                regular_cases_summaries, 
                pre_contracted_cases_summaries
                ),
            totals=Totals(regular=regular, pre_contracted=pre_contracted),
            actual_work_hours=week_working_hours.working_days
        )
        
        weeks.append(week)
        start_of_week += pd.Timedelta(days=7)
            
    return PerformanceAnalysis(
        start=start,
        end=end,
        date_of_interest=date_of_interest,
        weeks=weeks
    )