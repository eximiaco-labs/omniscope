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

@dataclass
class TotalsRegular:
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    wasted_hours: float
    over_approved_hours: float
    
@dataclass
class TotalsPreContracted:
    approved_work_hours: float
    actual_work_hours: float
    in_context_actual_work_hours: float
    possible_unpaid_hours: float
    possible_idle_hours: float
    
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
    
@dataclass
class ClientPerformanceSummary:
    name: str
    totals: Totals
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    sponsors: List[SponsorPerformanceSummary]

@dataclass
class AccountManagerPerformanceSummary:
    name: str
    totals: Totals
    regular_cases: List[OneWeekRegularCasePerformanceSummary]
    pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary]
    clients: List[ClientPerformanceSummary]

@dataclass
class WeekPerformanceAnalysis:
    start: datetime
    end: datetime
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

    def calculate_case_metrics(case, actual_hours: float, this_month_hours: float):
        client = globals.omni_models.clients.get_by_id(case.client_id) if case.client_id else None
        account_manager = client.account_manager.name if client and client.account_manager else 'N/A'
        weekly_approved_hours = case.weekly_approved_hours if case.weekly_approved_hours else 0
        
        if case.pre_contracted_value:
            possible_unpaid_hours = max(0, actual_hours - weekly_approved_hours)
            possible_idle_hours = abs(min(0, actual_hours - weekly_approved_hours))
            return OneWeekPreContractedCasePerformanceSummary(
                id=case.id,
                title=case.title,
                sponsor=case.sponsor if case.sponsor else 'N/A',
                client=client.name if client else 'N/A',
                account_manager=account_manager,
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
                id=case.id,
                title=case.title,
                sponsor=case.sponsor if case.sponsor else 'N/A',
                client=client.name if client else 'N/A',
                account_manager=account_manager,
                approved_work_hours=weekly_approved_hours,
                actual_work_hours=actual_hours,
                in_context_actual_work_hours=this_month_hours,
                wasted_hours=wasted_hours,
                over_approved_hours=over_approved_hours
            )

    def calculate_entity_summary(regular_cases: List[OneWeekRegularCasePerformanceSummary], 
                               pre_contracted_cases: List[OneWeekPreContractedCasePerformanceSummary], 
                               entity_type: str) -> List[ClientPerformanceSummary | SponsorPerformanceSummary | AccountManagerPerformanceSummary]:
        summaries = []
        
        if entity_type == 'client':
            entities = {case.client for case in regular_cases + pre_contracted_cases}
            for entity in entities:
                reg_cases = [case for case in regular_cases if case.client == entity]
                pre_cases = [case for case in pre_contracted_cases if case.client == entity]
                
                regular = TotalsRegular(
                    approved_work_hours=sum(case.approved_work_hours for case in reg_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in reg_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in reg_cases),
                    wasted_hours=sum(case.wasted_hours for case in reg_cases),
                    over_approved_hours=sum(case.over_approved_hours for case in reg_cases)
                )
                
                pre_contracted = TotalsPreContracted(
                    approved_work_hours=sum(case.approved_work_hours for case in pre_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in pre_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in pre_cases),
                    possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_cases),
                    possible_idle_hours=sum(case.possible_idle_hours for case in pre_cases)
                )
                
                sponsors = []
                for sponsor in set(case.sponsor for case in reg_cases + pre_cases):
                    sponsor_reg_cases = [c for c in reg_cases if c.sponsor == sponsor]
                    sponsor_pre_cases = [c for c in pre_cases if c.sponsor == sponsor]
                    
                    sponsor_regular = TotalsRegular(
                        approved_work_hours=sum(case.approved_work_hours for case in sponsor_reg_cases),
                        actual_work_hours=sum(case.actual_work_hours for case in sponsor_reg_cases),
                        in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in sponsor_reg_cases),
                        wasted_hours=sum(case.wasted_hours for case in sponsor_reg_cases),
                        over_approved_hours=sum(case.over_approved_hours for case in sponsor_reg_cases)
                    )
                    
                    sponsor_pre_contracted = TotalsPreContracted(
                        approved_work_hours=sum(case.approved_work_hours for case in sponsor_pre_cases),
                        actual_work_hours=sum(case.actual_work_hours for case in sponsor_pre_cases),
                        in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in sponsor_pre_cases),
                        possible_unpaid_hours=sum(case.possible_unpaid_hours for case in sponsor_pre_cases),
                        possible_idle_hours=sum(case.possible_idle_hours for case in sponsor_pre_cases)
                    )
                    
                    sponsors.append(SponsorPerformanceSummary(
                        name=sponsor,
                        totals=Totals(regular=sponsor_regular, pre_contracted=sponsor_pre_contracted),
                        regular_cases=sponsor_reg_cases,
                        pre_contracted_cases=sponsor_pre_cases
                    ))
                
                summary = ClientPerformanceSummary(
                    name=entity,
                    totals=Totals(regular=regular, pre_contracted=pre_contracted),
                    regular_cases=reg_cases,
                    pre_contracted_cases=pre_cases,
                    sponsors=sponsors
                )
                summaries.append(summary)
                
        elif entity_type == 'sponsor':
            entities = {case.sponsor for case in regular_cases + pre_contracted_cases}
            for entity in entities:
                reg_cases = [case for case in regular_cases if case.sponsor == entity]
                pre_cases = [case for case in pre_contracted_cases if case.sponsor == entity]
                
                regular = TotalsRegular(
                    approved_work_hours=sum(case.approved_work_hours for case in reg_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in reg_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in reg_cases),
                    wasted_hours=sum(case.wasted_hours for case in reg_cases),
                    over_approved_hours=sum(case.over_approved_hours for case in reg_cases)
                )
                
                pre_contracted = TotalsPreContracted(
                    approved_work_hours=sum(case.approved_work_hours for case in pre_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in pre_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in pre_cases),
                    possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_cases),
                    possible_idle_hours=sum(case.possible_idle_hours for case in pre_cases)
                )
                
                summary = SponsorPerformanceSummary(
                    name=entity,
                    totals=Totals(regular=regular, pre_contracted=pre_contracted),
                    regular_cases=reg_cases,
                    pre_contracted_cases=pre_cases
                )
                summaries.append(summary)
                
        else:  # account_manager
            entities = {case.account_manager for case in regular_cases + pre_contracted_cases}
            for entity in entities:
                reg_cases = [case for case in regular_cases if case.account_manager == entity]
                pre_cases = [case for case in pre_contracted_cases if case.account_manager == entity]
                
                regular = TotalsRegular(
                    approved_work_hours=sum(case.approved_work_hours for case in reg_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in reg_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in reg_cases),
                    wasted_hours=sum(case.wasted_hours for case in reg_cases),
                    over_approved_hours=sum(case.over_approved_hours for case in reg_cases)
                )
                
                pre_contracted = TotalsPreContracted(
                    approved_work_hours=sum(case.approved_work_hours for case in pre_cases),
                    actual_work_hours=sum(case.actual_work_hours for case in pre_cases),
                    in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in pre_cases),
                    possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_cases),
                    possible_idle_hours=sum(case.possible_idle_hours for case in pre_cases)
                )
                
                clients = []
                for client in set(case.client for case in reg_cases + pre_cases):
                    client_reg_cases = [c for c in reg_cases if c.client == client]
                    client_pre_cases = [c for c in pre_cases if c.client == client]
                    
                    client_regular = TotalsRegular(
                        approved_work_hours=sum(case.approved_work_hours for case in client_reg_cases),
                        actual_work_hours=sum(case.actual_work_hours for case in client_reg_cases),
                        in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in client_reg_cases),
                        wasted_hours=sum(case.wasted_hours for case in client_reg_cases),
                        over_approved_hours=sum(case.over_approved_hours for case in client_reg_cases)
                    )
                    
                    client_pre_contracted = TotalsPreContracted(
                        approved_work_hours=sum(case.approved_work_hours for case in client_pre_cases),
                        actual_work_hours=sum(case.actual_work_hours for case in client_pre_cases),
                        in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in client_pre_cases),
                        possible_unpaid_hours=sum(case.possible_unpaid_hours for case in client_pre_cases),
                        possible_idle_hours=sum(case.possible_idle_hours for case in client_pre_cases)
                    )
                    
                    client_sponsors = []
                    for sponsor in set(case.sponsor for case in client_reg_cases + client_pre_cases):
                        sponsor_reg_cases = [c for c in client_reg_cases if c.sponsor == sponsor]
                        sponsor_pre_cases = [c for c in client_pre_cases if c.sponsor == sponsor]
                        
                        sponsor_regular = TotalsRegular(
                            approved_work_hours=sum(case.approved_work_hours for case in sponsor_reg_cases),
                            actual_work_hours=sum(case.actual_work_hours for case in sponsor_reg_cases),
                            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in sponsor_reg_cases),
                            wasted_hours=sum(case.wasted_hours for case in sponsor_reg_cases),
                            over_approved_hours=sum(case.over_approved_hours for case in sponsor_reg_cases)
                        )
                        
                        sponsor_pre_contracted = TotalsPreContracted(
                            approved_work_hours=sum(case.approved_work_hours for case in sponsor_pre_cases),
                            actual_work_hours=sum(case.actual_work_hours for case in sponsor_pre_cases),
                            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in sponsor_pre_cases),
                            possible_unpaid_hours=sum(case.possible_unpaid_hours for case in sponsor_pre_cases),
                            possible_idle_hours=sum(case.possible_idle_hours for case in sponsor_pre_cases)
                        )
                        
                        client_sponsors.append(SponsorPerformanceSummary(
                            name=sponsor,
                            totals=Totals(regular=sponsor_regular, pre_contracted=sponsor_pre_contracted),
                            regular_cases=sponsor_reg_cases,
                            pre_contracted_cases=sponsor_pre_cases
                        ))
                    
                    clients.append(ClientPerformanceSummary(
                        name=client,
                        totals=Totals(regular=client_regular, pre_contracted=client_pre_contracted),
                        regular_cases=client_reg_cases,
                        pre_contracted_cases=client_pre_cases,
                        sponsors=client_sponsors
                    ))
                
                summary = AccountManagerPerformanceSummary(
                    name=entity,
                    totals=Totals(regular=regular, pre_contracted=pre_contracted),
                    regular_cases=reg_cases,
                    pre_contracted_cases=pre_cases,
                    clients=clients
                )
                summaries.append(summary)
                
        return summaries
    
    end_of_analysis = e.date()
    while sw <= end_of_analysis:
        s, e = Weeks.get_week_dates(sw)
        cases = [case for case in all_cases if is_case_active(case, s, e)]
        
        actual_work_hours = []
        by_case_hours = {}
        by_case_month_hours = {}
        current_date = s.date()
        
        while current_date <= min(e.date(), end_of_analysis):
            day_timesheet = timesheet[pd.to_datetime(timesheet['Date']).dt.date == current_date]
            by_case, case_hours = get_case_hours_for_day(day_timesheet)
            # by_case_hours[case_hour.case_id] = by_case_hours.get(case_hour.case_id, 0) + case_hour.hours
            
            # Track monthly hours separately
            for case_hour in by_case:
                by_case_hours[case_hour.case_id] = by_case_hours.get(case_hour.case_id, 0) + case_hour.hours
                if current_date.month == date_of_interest.month:
                    by_case_month_hours[case_hour.case_id] = by_case_month_hours.get(case_hour.case_id, 0) + case_hour.hours
            
            day_hours = WorkingDayHours(
                date=current_date,
                hours=day_timesheet['TimeInHs'].sum(),
                pre_contracted_work_hours=sum(case.hours for case in by_case if case.pre_contracted),
                regular_work_hours=sum(case.hours for case in by_case if not case.pre_contracted),
                by_case=by_case
            )
            actual_work_hours.append(day_hours)
            current_date += pd.Timedelta(days=1)
            
        case_summaries = [calculate_case_metrics(case, by_case_hours.get(case.id, 0), by_case_month_hours.get(case.id, 0)) 
                         for case in cases
                         if (case.is_active and case.weekly_approved_hours and case.weekly_approved_hours > 0) or
                            (by_case_hours.get(case.id, 0) > 0)]
        
        regular_cases = [case for case in case_summaries if isinstance(case, OneWeekRegularCasePerformanceSummary)]
        pre_contracted_cases = [case for case in case_summaries if isinstance(case, OneWeekPreContractedCasePerformanceSummary)]
        
        clients_ = calculate_entity_summary(regular_cases, pre_contracted_cases, 'client')
        account_managers_ = calculate_entity_summary(regular_cases, pre_contracted_cases, 'account_manager')
        sponsors_ = calculate_entity_summary(regular_cases, pre_contracted_cases, 'sponsor')
        
        regular = TotalsRegular(
            approved_work_hours=sum(case.weekly_approved_hours for case in cases if not case.pre_contracted_value and case.weekly_approved_hours),
            actual_work_hours=sum(case.actual_work_hours for case in regular_cases),
            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in regular_cases),
            wasted_hours=sum(case.wasted_hours for case in regular_cases),
            over_approved_hours=sum(case.over_approved_hours for case in regular_cases),
        )
        
        pre_contracted = TotalsPreContracted(
            approved_work_hours=sum(case.weekly_approved_hours for case in cases if case.pre_contracted_value and case.weekly_approved_hours),
            actual_work_hours=sum(case.actual_work_hours for case in pre_contracted_cases),
            in_context_actual_work_hours=sum(case.in_context_actual_work_hours for case in pre_contracted_cases),
            possible_unpaid_hours=sum(case.possible_unpaid_hours for case in pre_contracted_cases),
            possible_idle_hours=sum(case.possible_idle_hours for case in pre_contracted_cases)
        )
        
        week = WeekPerformanceAnalysis(
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