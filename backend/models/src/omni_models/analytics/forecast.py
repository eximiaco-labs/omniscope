from typing import Any, Dict, Optional
from omni_utils.helpers.dates import get_same_day_one_month_ago, get_same_day_one_month_later, get_last_day_of_month, get_working_days_in_month
from datetime import datetime, date
import calendar
from pydantic import BaseModel
from omni_models.analytics.revenue_tracking import RevenueTracking

from omni_shared import globals
from omni_models.analytics.revenue_tracking import compute_revenue_tracking
from omni_models.analytics import forecast_types


labels_suffix_future = [
    '', 
    'one_month_later', 
    'two_months_later', 
    'three_months_later'
]

labels_expected = [
    'expected', 
    'expected_' + labels_suffix_future[1], 
    'expected_' + labels_suffix_future[2], 
    'expected_' + labels_suffix_future[3]
]

class ForecastDates(BaseModel):
    in_analysis: datetime
    same_day_one_month_ago: datetime
    last_day_of_one_month_ago: datetime
    same_day_two_months_ago: datetime
    last_day_of_two_months_ago: datetime
    same_day_three_months_ago: datetime
    last_day_of_three_months_ago: datetime
    same_day_one_month_later: datetime
    last_day_of_one_month_later: datetime
    same_day_two_months_later: datetime
    last_day_of_two_months_later: datetime
    same_day_three_months_later: datetime
    last_day_of_three_months_later: datetime
    
    @classmethod
    def build(cls, date_of_interest: datetime) -> 'ForecastDates':
        same_day_one_month_ago = get_same_day_one_month_ago(date_of_interest)
        same_day_two_months_ago = get_same_day_one_month_ago(same_day_one_month_ago)
        same_day_three_months_ago = get_same_day_one_month_ago(same_day_two_months_ago)
        
        same_day_one_month_later = get_same_day_one_month_later(date_of_interest)
        same_day_two_months_later = get_same_day_one_month_later(same_day_one_month_later)
        same_day_three_months_later = get_same_day_one_month_later(same_day_two_months_later)
        
        return cls(
            in_analysis=date_of_interest,
            same_day_one_month_ago=same_day_one_month_ago,
            last_day_of_one_month_ago=get_last_day_of_month(same_day_one_month_ago),
            same_day_two_months_ago=same_day_two_months_ago,
            last_day_of_two_months_ago=get_last_day_of_month(same_day_two_months_ago),
            same_day_three_months_ago=same_day_three_months_ago,
            last_day_of_three_months_ago=get_last_day_of_month(same_day_three_months_ago),
            same_day_one_month_later=same_day_one_month_later,
            last_day_of_one_month_later=get_last_day_of_month(same_day_one_month_later),
            same_day_two_months_later=same_day_two_months_later,
            last_day_of_two_months_later=get_last_day_of_month(same_day_two_months_later),
            same_day_three_months_later=same_day_three_months_later,
            last_day_of_three_months_later=get_last_day_of_month(same_day_three_months_later)
        )

class ForecastNumberOfWorkingDays(BaseModel):
    in_analysis: int
    in_analysis_partial: int
    one_month_ago: int
    same_day_one_month_ago: int
    two_months_ago: int
    same_day_two_months_ago: int
    three_months_ago: int
    same_day_three_months_ago: int
    one_month_later: int
    same_day_one_month_later: int
    two_months_later: int
    same_day_two_months_later: int
    three_months_later: int
    same_day_three_months_later: int

    @classmethod
    def build(cls, date_of_interest: datetime, forecast_dates: ForecastDates) -> 'ForecastNumberOfWorkingDays':
        return cls(
            in_analysis=len(get_working_days_in_month(date_of_interest.year, date_of_interest.month)),
            in_analysis_partial=len([d for d in get_working_days_in_month(date_of_interest.year, date_of_interest.month) if d.day <= date_of_interest.day]),
            
            one_month_ago=len(get_working_days_in_month(forecast_dates.same_day_one_month_ago.year, forecast_dates.same_day_one_month_ago.month)),
            same_day_one_month_ago=len([d for d in get_working_days_in_month(forecast_dates.same_day_one_month_ago.year, forecast_dates.same_day_one_month_ago.month) if d.day <= date_of_interest.day]),
            
            two_months_ago=len(get_working_days_in_month(forecast_dates.same_day_two_months_ago.year, forecast_dates.same_day_two_months_ago.month)),
            same_day_two_months_ago=len([d for d in get_working_days_in_month(forecast_dates.same_day_two_months_ago.year, forecast_dates.same_day_two_months_ago.month) if d.day <= date_of_interest.day]),
            
            three_months_ago=len(get_working_days_in_month(forecast_dates.same_day_three_months_ago.year, forecast_dates.same_day_three_months_ago.month)),
            same_day_three_months_ago=len([d for d in get_working_days_in_month(forecast_dates.same_day_three_months_ago.year, forecast_dates.same_day_three_months_ago.month) if d.day <= date_of_interest.day]),
            
            one_month_later=len(get_working_days_in_month(forecast_dates.same_day_one_month_later.year, forecast_dates.same_day_one_month_later.month)),
            same_day_one_month_later=len([d for d in get_working_days_in_month(forecast_dates.same_day_one_month_later.year, forecast_dates.same_day_one_month_later.month) if d.day <= date_of_interest.day]),
            
            two_months_later=len(get_working_days_in_month(forecast_dates.same_day_two_months_later.year, forecast_dates.same_day_two_months_later.month)),
            same_day_two_months_later=len([d for d in get_working_days_in_month(forecast_dates.same_day_two_months_later.year, forecast_dates.same_day_two_months_later.month) if d.day <= date_of_interest.day]),
            
            three_months_later=len(get_working_days_in_month(forecast_dates.same_day_three_months_later.year, forecast_dates.same_day_three_months_later.month)),
            same_day_three_months_later=len([d for d in get_working_days_in_month(forecast_dates.same_day_three_months_later.year, forecast_dates.same_day_three_months_later.month) if d.day <= date_of_interest.day])
        )

class ForecastRevenueTrackings(BaseModel):
    date_of_interest: RevenueTracking
    last_day_of_last_month: RevenueTracking
    last_day_of_two_months_ago: RevenueTracking
    last_day_of_three_months_ago: RevenueTracking
    same_day_last_month: RevenueTracking
    same_day_two_months_ago: RevenueTracking
    same_day_three_months_ago: RevenueTracking
    
    def __init__(self, forecast_dates: ForecastDates, filters: Dict[str, Any]):
        super().__init__(
            date_of_interest=compute_revenue_tracking(forecast_dates.in_analysis, filters=filters),
            last_day_of_last_month=compute_revenue_tracking(forecast_dates.last_day_of_one_month_ago, filters=filters),
            last_day_of_two_months_ago=compute_revenue_tracking(forecast_dates.last_day_of_two_months_ago, filters=filters),
            last_day_of_three_months_ago=compute_revenue_tracking(forecast_dates.last_day_of_three_months_ago, filters=filters),
            same_day_last_month=compute_revenue_tracking(forecast_dates.same_day_one_month_ago, filters=filters),
            same_day_two_months_ago=compute_revenue_tracking(forecast_dates.same_day_two_months_ago, filters=filters),
            same_day_three_months_ago=compute_revenue_tracking(forecast_dates.same_day_three_months_ago, filters=filters)
        )

def merge_filterable_fields(analysis_lists):
    filterable_fields = []
    
    for field_list in analysis_lists:
        for field in field_list.filterable_fields:
            existing = next((f for f in filterable_fields if f['field'] == field['field']), None)
            
            if existing:
                existing['options'] = sorted(list(set(existing['options'] + field['options'])))
                existing['selected_values'] = sorted(list(set(existing['selected_values'] + field['selected_values'])))
            else:
                filterable_fields.append(field.copy())
    
    return filterable_fields

class DailyActual(BaseModel):
    total_consulting_fee: float
    total_consulting_hours: float
    acc_total_consulting_fee: Optional[float] = None
    acc_total_consulting_hours: Optional[float] = None

class DailyExpected(BaseModel):
    total_consulting_fee: float
    total_consulting_hours: float
    acc_total_consulting_fee: float
    acc_total_consulting_hours: float

class DailyDifference(BaseModel):
    total_consulting_fee: Optional[float] = None
    total_consulting_hours: Optional[float] = None
    acc_total_consulting_fee: Optional[float] = None
    acc_total_consulting_hours: Optional[float] = None

class DailyForecast(BaseModel):
    date: date
    actual: DailyActual
    expected: DailyExpected
    difference: DailyDifference

class ForecastSummary(BaseModel):
    realized: float
    projected: float
    expected: float
    one_month_ago: float
    two_months_ago: float
    three_months_ago: float
    expected_one_month_later: float
    expected_two_months_later: float
    expected_three_months_later: float
    in_analysis_consulting_hours: float
    in_analysis_consulting_pre_hours: float
    one_month_ago_consulting_hours: float
    one_month_ago_consulting_pre_hours: float
    two_months_ago_consulting_hours: float
    two_months_ago_consulting_pre_hours: float
    three_months_ago_consulting_hours: float
    three_months_ago_consulting_pre_hours: float
    same_day_one_month_ago_consulting_hours: float
    same_day_two_months_ago_consulting_hours: float
    same_day_three_months_ago_consulting_hours: float

class ForecastByKind(BaseModel):
    consulting: dict
    consulting_pre: dict
    hands_on: dict
    squad: dict

class ForecastResult(BaseModel):
    date_of_interest: datetime
    dates: ForecastDates
    by_kind: ForecastByKind
    filterable_fields: list
    summary: ForecastSummary
    working_days: ForecastNumberOfWorkingDays
    daily: list[DailyForecast]

def compute_forecast(date_of_interest = None, filters = None):
    if date_of_interest is None:
        date_of_interest = datetime.now()

    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
        
    forecast_dates = ForecastDates.build(date_of_interest)
    forecast_revenue_trackings = ForecastRevenueTrackings(forecast_dates, filters)
    forecast_working_days = ForecastNumberOfWorkingDays.build(date_of_interest, forecast_dates)
    
    daily = {
        date.date: DailyForecast(
            date=date.date,
            actual=DailyActual(
                total_consulting_fee=date.total_consulting_fee,
                total_consulting_hours=date.total_consulting_hours,
                acc_total_consulting_fee=None,
                acc_total_consulting_hours=None
            ),
            expected=DailyExpected(
                total_consulting_fee=0,
                total_consulting_hours=0,
                acc_total_consulting_fee=0,
                acc_total_consulting_hours=0
            ),
            difference=DailyDifference(
                total_consulting_fee=None,
                total_consulting_hours=None,
                acc_total_consulting_fee=None,
                acc_total_consulting_hours=None
            )
        )
        for date in forecast_revenue_trackings.date_of_interest.regular.daily
    }
    
    def summarize_forecast(slug):
        clients: Dict[str, forecast_types.ClientForecast] = {}
        sponsors: Dict[str, forecast_types.SponsorForecast] = {}
        cases: Dict[str, forecast_types.CaseForecast] = {}
        projects: Dict[str, forecast_types.ProjectForecast] = {}
        consultants: Dict[str, forecast_types.ConsultantForecast] = {}
        
        def add_context(context, context_slug):
            for consultant in context.summaries.by_consultant:
                if consultant.slug not in consultants:
                    consultants[consultant.slug] = forecast_types.ConsultantForecast(
                        name=consultant.name,
                        slug=consultant.slug
                    )
                
                working_consultant = consultants[consultant.slug]
                setattr(working_consultant, context_slug, consultant.consulting_fee)
                setattr(working_consultant, f'{context_slug}_consulting_hours', consultant.consulting_hours)
                setattr(working_consultant, f'{context_slug}_consulting_pre_hours', consultant.consulting_pre_hours)
            
            for client in context.summaries.by_client:
                if client.slug not in clients:
                    clients[client.slug] = forecast_types.ClientForecast(
                        name=client.name,
                        slug=client.slug
                    )

                working_client = clients[client.slug]
                setattr(working_client, context_slug, client.get_fee(slug))
                if slug == 'consulting':
                    setattr(working_client, f'{context_slug}_consulting_hours', client.consulting_hours)
                    setattr(working_client, f'{context_slug}_consulting_fee_new', client.consulting_fee_new)
                elif slug == 'consulting_pre':
                    setattr(working_client, f'{context_slug}_consulting_pre_hours', client.consulting_pre_hours)
                    
                for sponsor in client.by_sponsor:
                    if sponsor.name not in sponsors:
                        sponsors[sponsor.name] = forecast_types.SponsorForecast(
                            name=sponsor.name,
                            slug=sponsor.slug,
                            client_slug=client.slug
                        )
                    
                    working_sponsor = sponsors[sponsor.name]
                    setattr(working_sponsor, context_slug, sponsor.get_fee(slug))
                    
                    if slug == 'consulting':
                        setattr(working_sponsor, f'{context_slug}_consulting_hours', sponsor.consulting_hours)
                        setattr(working_sponsor, f'{context_slug}_consulting_fee_new', sponsor.consulting_fee_new)
                    elif slug == 'consulting_pre':
                        setattr(working_sponsor, f'{context_slug}_consulting_pre_hours', sponsor.consulting_pre_hours)
                        
                    for case in sponsor.by_case:
                        if case.title not in cases:
                            case_ = globals.omni_models.cases.get_by_title(case.title)
                            cases[case.title] = forecast_types.CaseForecast(
                                title=case.title,
                                slug=case.slug,
                                sponsor_slug=sponsor.slug,
                                client_slug=client.slug,
                                start_of_contract=case_.start_of_contract,
                                end_of_contract=case_.end_of_contract,
                                weekly_approved_hours=case_.weekly_approved_hours
                            )
                            
                        working_case = cases[case.title]
                        setattr(working_case, context_slug, case.get_fee(slug))
                        
                        if slug == 'consulting':
                            setattr(working_case, f'{context_slug}_consulting_hours', case.consulting_hours)
                            setattr(working_case, 'consulting_fee_new', case.consulting_fee_new)
                        elif slug == 'consulting_pre':
                            setattr(working_case, f'{context_slug}_consulting_pre_hours', case.consulting_pre_hours)
                            
                        for project in case.by_project:
                            if project.name not in projects:
                                projects[project.name] = forecast_types.ProjectForecast(
                                    name=project.name,
                                    slug=project.slug,
                                    case_slug=case.slug
                                )
                            
                            working_project = projects[project.name]
                            setattr(working_project, context_slug, project.get_fee(slug))
                            
                            if slug == 'consulting':
                                setattr(working_project, f'{context_slug}_consulting_hours', project.consulting_hours)
                                setattr(working_project, f'{context_slug}_consulting_fee_new', project.consulting_fee_new)
                            elif slug == 'consulting_pre':
                                setattr(working_project, f'{context_slug}_consulting_pre_hours', project.consulting_pre_hours)
                                
        add_context(forecast_revenue_trackings.date_of_interest, 'in_analysis')
        add_context(forecast_revenue_trackings.last_day_of_last_month, 'one_month_ago')
        add_context(forecast_revenue_trackings.last_day_of_two_months_ago, 'two_months_ago')
        add_context(forecast_revenue_trackings.last_day_of_three_months_ago, 'three_months_ago')
        
        if slug == 'consulting':
            add_context(forecast_revenue_trackings.same_day_last_month, 'same_day_one_month_ago')
            add_context(forecast_revenue_trackings.same_day_two_months_ago, 'same_day_two_months_ago')
            add_context(forecast_revenue_trackings.same_day_three_months_ago, 'same_day_three_months_ago')
            
        def filter_items(items):
            return [
                item for item in items.values()
                if any(
                    getattr(item, period, 0) > 0 
                    for period in ['in_analysis', 'one_month_ago', 'two_months_ago', 'three_months_ago']
                )
            ]
        
        by_consultant = filter_items(consultants)
        by_client = filter_items(clients) 
        by_sponsor = filter_items(sponsors)
        by_case = filter_items(cases)
        by_project = filter_items(projects)
        
        ### projected and expected revenue
        if slug == 'consulting':
            for case in by_case:
                case_ = globals.omni_models.cases.get_by_title(case.title)
                if not case_.is_active:
                    continue
                
                wah = case_.weekly_approved_hours
                project_ = None
                for ti in case_.tracker_info:
                    if ti.kind == 'consulting' and ti.status == "open":
                        project_ = ti
                        break
                    
                if not project_:
                    continue
                
                year = date_of_interest.year    
                month = date_of_interest.month
                for n in range(0, 4):
                    days_in_month = calendar.monthrange(year, month)[1]
                    working_days_in_month = get_working_days_in_month(year, month)
                    
                    hours_in_month = 0
                    daily_approved_hours = wah / 5
            
                    
                    due_on = project_.due_on if project_.due_on else case_.end_of_contract
                    due_on = due_on.date() if hasattr(due_on, 'date') else due_on
                    
                    for day in range(1, days_in_month + 1):
                        date = datetime(year, month, day)
                        
                        if case_.start_of_contract and date.date() < case_.start_of_contract:
                            continue
                        
                        if due_on and date.date() > due_on:
                            break
                        
                        if date in working_days_in_month:
                            hours_in_month += daily_approved_hours
                            if date.date() in daily and project_ and project_.rate:
                                daily_forecast = daily[date.date()]
                                daily_forecast.expected.total_consulting_fee += daily_approved_hours * (project_.rate.rate / 100)
                                daily_forecast.expected.total_consulting_hours += daily_approved_hours
                            
                    if (project_ and project_.rate):
                        setattr(case, labels_expected[n], hours_in_month * (project_.rate.rate / 100))
                    else:
                        print(f'NO-RATE: {project_.name} - {case.title}')
                    
                    month += 1
                    if month > 12:
                        month = 1
                        year += 1
                

            for sponsor in by_sponsor:
                for n in range(0, 4):
                    setattr(sponsor, labels_expected[n], sum(
                        getattr(case, labels_expected[n], 0)
                        for case in by_case
                        if case.sponsor_slug == sponsor.slug
                    ))
                
            for client in by_client:
                for n in range(0, 4):
                    setattr(client, labels_expected[n], sum(
                        getattr(sponsor, labels_expected[n], 0)
                        for sponsor in by_sponsor
                        if sponsor.client_slug == client.slug
                    ))

            for project in by_project:
                for n in range(0, 4):
                    setattr(project, labels_expected[n], 0)
        
        def adjust_entity(entity):
            if slug == 'consulting':
                divisor = forecast_working_days.in_analysis_partial or 1
                entity.projected = (entity.in_analysis / divisor) * forecast_working_days.in_analysis
                
                previous_value = entity.one_month_ago
                two_months_ago_value = entity.two_months_ago
                three_months_ago_value = entity.three_months_ago
                
                if previous_value == 0 and two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity.expected_historical = entity.projected if entity.projected else 0
                elif two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity.expected_historical = previous_value
                elif three_months_ago_value == 0:
                    entity.expected_historical = previous_value * 0.8 + two_months_ago_value * 0.2
                else:
                    entity.expected_historical = previous_value * 0.6 + two_months_ago_value * 0.25 + three_months_ago_value * 0.15
                    
            elif slug == 'consulting_pre':
                divisor = forecast_working_days.in_analysis_partial or 1
                entity.projected = (entity.in_analysis / divisor) * forecast_working_days.in_analysis
               
               
        for client in by_client:
            adjust_entity(client)
        
        for sponsor in by_sponsor:
            adjust_entity(sponsor)
            
        for case in by_case:
            adjust_entity(case)
            
            
        for project in by_project:
            adjust_entity(project)
            
        for consultant in by_consultant:
            adjust_entity(consultant)

        return {
            'slug': slug,
            'by_client': by_client,
            'by_sponsor': by_sponsor,
            'by_case': by_case,
            'by_project': by_project,
            'by_consultant': by_consultant,
            'totals': forecast_types.Totals.build(by_client)
        }
    
    filterable_fields = merge_filterable_fields([
        forecast_revenue_trackings.date_of_interest,
        forecast_revenue_trackings.last_day_of_last_month,
        forecast_revenue_trackings.last_day_of_two_months_ago,
        forecast_revenue_trackings.last_day_of_three_months_ago
    ])
    
    by_kind = ForecastByKind(
        consulting=summarize_forecast('consulting'),
        consulting_pre=summarize_forecast('consulting_pre'),
        hands_on=summarize_forecast('hands_on'),
        squad=summarize_forecast('squad')
    )
    
    summary = ForecastSummary(
        realized=sum(by_kind.__dict__[kind]["totals"].in_analysis for kind in by_kind.__dict__),
        projected=by_kind.consulting["totals"].projected + sum(by_kind.__dict__[kind]["totals"].in_analysis for kind in by_kind.__dict__ if kind != "consulting"),
        expected=by_kind.consulting["totals"].expected + sum(by_kind.__dict__[kind]["totals"].in_analysis for kind in by_kind.__dict__ if kind != "consulting"),
        one_month_ago=sum(by_kind.__dict__[kind]["totals"].one_month_ago for kind in by_kind.__dict__),
        two_months_ago=sum(by_kind.__dict__[kind]["totals"].two_months_ago for kind in by_kind.__dict__),
        three_months_ago=sum(by_kind.__dict__[kind]["totals"].three_months_ago for kind in by_kind.__dict__),
        expected_one_month_later=sum(by_kind.__dict__[kind]["totals"].expected_one_month_later for kind in by_kind.__dict__),
        expected_two_months_later=sum(by_kind.__dict__[kind]["totals"].expected_two_months_later for kind in by_kind.__dict__),
        expected_three_months_later=sum(by_kind.__dict__[kind]["totals"].expected_three_months_later for kind in by_kind.__dict__),
        in_analysis_consulting_hours=sum(by_kind.__dict__[kind]["totals"].in_analysis_consulting_hours for kind in by_kind.__dict__),
        in_analysis_consulting_pre_hours=sum(by_kind.__dict__[kind]["totals"].in_analysis_consulting_pre_hours for kind in by_kind.__dict__),
        one_month_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].one_month_ago_consulting_hours for kind in by_kind.__dict__),
        one_month_ago_consulting_pre_hours=sum(by_kind.__dict__[kind]["totals"].one_month_ago_consulting_pre_hours for kind in by_kind.__dict__),
        two_months_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].two_months_ago_consulting_hours for kind in by_kind.__dict__),
        two_months_ago_consulting_pre_hours=sum(by_kind.__dict__[kind]["totals"].two_months_ago_consulting_pre_hours for kind in by_kind.__dict__),
        three_months_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].three_months_ago_consulting_hours for kind in by_kind.__dict__),
        three_months_ago_consulting_pre_hours=sum(by_kind.__dict__[kind]["totals"].three_months_ago_consulting_pre_hours for kind in by_kind.__dict__),
        same_day_one_month_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].same_day_one_month_ago_consulting_hours for kind in by_kind.__dict__),
        same_day_two_months_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].same_day_two_months_ago_consulting_hours for kind in by_kind.__dict__),
        same_day_three_months_ago_consulting_hours=sum(by_kind.__dict__[kind]["totals"].same_day_three_months_ago_consulting_hours for kind in by_kind.__dict__),
    )
    
    daily_list = sorted(list(daily.values()), key=lambda x: x.date)
    expected_acc_total_consulting_fee = 0
    expected_acc_total_consulting_hours = 0
    actual_acc_total_consulting_fee = 0
    actual_acc_total_consulting_hours = 0
    
    for d in daily_list:
        expected = d.expected
        actual = d.actual
        
        expected_acc_total_consulting_fee += expected.total_consulting_fee
        expected_acc_total_consulting_hours += expected.total_consulting_hours
        
        expected.acc_total_consulting_fee = expected_acc_total_consulting_fee
        expected.acc_total_consulting_hours = expected_acc_total_consulting_hours
        
        if d.date <= date_of_interest.date():
            actual_acc_total_consulting_fee += actual.total_consulting_fee
            actual_acc_total_consulting_hours += actual.total_consulting_hours
            
            actual.acc_total_consulting_fee = actual_acc_total_consulting_fee
            actual.acc_total_consulting_hours = actual_acc_total_consulting_hours
            
            d.difference = DailyDifference(
                total_consulting_fee=actual.total_consulting_fee - expected.total_consulting_fee,
                total_consulting_hours=actual.total_consulting_hours - expected.total_consulting_hours,
                acc_total_consulting_fee=actual_acc_total_consulting_fee - expected_acc_total_consulting_fee,
                acc_total_consulting_hours=actual_acc_total_consulting_hours - expected_acc_total_consulting_hours
            )
    
    return ForecastResult(
        date_of_interest=date_of_interest,
        dates=forecast_dates,
        by_kind=by_kind,
        filterable_fields=filterable_fields,
        summary=summary,
        working_days=forecast_working_days,
        daily=daily_list
    )

    