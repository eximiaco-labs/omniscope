from typing import Any, Dict
from omni_utils.helpers.dates import get_same_day_one_month_ago, get_same_day_one_month_later, get_last_day_of_month, get_working_days_in_month
from datetime import datetime
import calendar
from dataclasses import dataclass

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

@dataclass
class ForecastDates:
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
    
    def __init__(self, date_of_interest: datetime):
        self.in_analysis = date_of_interest
        self.same_day_one_month_ago = get_same_day_one_month_ago(date_of_interest)
        self.last_day_of_one_month_ago = get_last_day_of_month(self.same_day_one_month_ago)
        
        self.same_day_two_months_ago = get_same_day_one_month_ago(self.same_day_one_month_ago)
        self.last_day_of_two_months_ago = get_last_day_of_month(self.same_day_two_months_ago)
        
        self.same_day_three_months_ago = get_same_day_one_month_ago(self.same_day_two_months_ago)
        self.last_day_of_three_months_ago = get_last_day_of_month(self.same_day_three_months_ago)
        
        self.same_day_one_month_later = get_same_day_one_month_later(date_of_interest)
        self.last_day_of_one_month_later = get_last_day_of_month(self.same_day_one_month_later)
        
        self.same_day_two_months_later = get_same_day_one_month_later(self.same_day_one_month_later)
        self.last_day_of_two_months_later = get_last_day_of_month(self.same_day_two_months_later)
        
        self.same_day_three_months_later = get_same_day_one_month_later(self.same_day_two_months_later)
        self.last_day_of_three_months_later = get_last_day_of_month(self.same_day_three_months_later)

@dataclass 
class ForecastNumberOfWorkingDays:
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

    def __init__(self, date_of_interest: datetime, forecast_dates: ForecastDates):
        self.in_analysis = len(get_working_days_in_month(date_of_interest.year, date_of_interest.month))
        self.in_analysis_partial = len([d for d in get_working_days_in_month(date_of_interest.year, date_of_interest.month) if d.day <= date_of_interest.day])
        
        self.one_month_ago = len(get_working_days_in_month(forecast_dates.same_day_one_month_ago.year, forecast_dates.same_day_one_month_ago.month))
        self.same_day_one_month_ago = len([d for d in get_working_days_in_month(forecast_dates.same_day_one_month_ago.year, forecast_dates.same_day_one_month_ago.month) if d.day <= date_of_interest.day])
        
        self.two_months_ago = len(get_working_days_in_month(forecast_dates.same_day_two_months_ago.year, forecast_dates.same_day_two_months_ago.month))
        self.same_day_two_months_ago = len([d for d in get_working_days_in_month(forecast_dates.same_day_two_months_ago.year, forecast_dates.same_day_two_months_ago.month) if d.day <= date_of_interest.day])
        
        self.three_months_ago = len(get_working_days_in_month(forecast_dates.same_day_three_months_ago.year, forecast_dates.same_day_three_months_ago.month))
        self.same_day_three_months_ago = len([d for d in get_working_days_in_month(forecast_dates.same_day_three_months_ago.year, forecast_dates.same_day_three_months_ago.month) if d.day <= date_of_interest.day])
        
        self.one_month_later = len(get_working_days_in_month(forecast_dates.same_day_one_month_later.year, forecast_dates.same_day_one_month_later.month))
        self.same_day_one_month_later = len([d for d in get_working_days_in_month(forecast_dates.same_day_one_month_later.year, forecast_dates.same_day_one_month_later.month) if d.day <= date_of_interest.day])
        
        self.two_months_later = len(get_working_days_in_month(forecast_dates.same_day_two_months_later.year, forecast_dates.same_day_two_months_later.month))
        self.same_day_two_months_later = len([d for d in get_working_days_in_month(forecast_dates.same_day_two_months_later.year, forecast_dates.same_day_two_months_later.month) if d.day <= date_of_interest.day])
        
        self.three_months_later = len(get_working_days_in_month(forecast_dates.same_day_three_months_later.year, forecast_dates.same_day_three_months_later.month))
        self.same_day_three_months_later = len([d for d in get_working_days_in_month(forecast_dates.same_day_three_months_later.year, forecast_dates.same_day_three_months_later.month) if d.day <= date_of_interest.day])
    
@dataclass
class ForecastRevenueTrackings:
    date_of_interest: Dict[str, Any]
    last_day_of_last_month: Dict[str, Any]
    last_day_of_two_months_ago: Dict[str, Any]
    last_day_of_three_months_ago: Dict[str, Any]
    same_day_last_month: Dict[str, Any]
    same_day_two_months_ago: Dict[str, Any]
    same_day_three_months_ago: Dict[str, Any]
    
    def __init__(self, forecast_dates: ForecastDates, filters: Dict[str, Any]):
        self.date_of_interest = compute_revenue_tracking(forecast_dates.in_analysis, filters=filters)
        self.last_day_of_last_month = compute_revenue_tracking(forecast_dates.last_day_of_one_month_ago, filters=filters)
        self.last_day_of_two_months_ago = compute_revenue_tracking(forecast_dates.last_day_of_two_months_ago, filters=filters)
        self.last_day_of_three_months_ago = compute_revenue_tracking(forecast_dates.last_day_of_three_months_ago, filters=filters)
        self.same_day_last_month = compute_revenue_tracking(forecast_dates.same_day_one_month_ago, filters=filters)
        self.same_day_two_months_ago = compute_revenue_tracking(forecast_dates.same_day_two_months_ago, filters=filters)
        self.same_day_three_months_ago = compute_revenue_tracking(forecast_dates.same_day_three_months_ago, filters=filters)

def merge_filterable_fields(analysis_lists):
    filterable_fields = []
    
    for field_list in analysis_lists:
        for field in field_list['filterable_fields']:
            existing = next((f for f in filterable_fields if f['field'] == field['field']), None)
            
            if existing:
                existing['options'] = sorted(list(set(existing['options'] + field['options'])))
                existing['selected_values'] = sorted(list(set(existing['selected_values'] + field['selected_values'])))
            else:
                filterable_fields.append(field.copy())
    
    return filterable_fields

def compute_forecast(date_of_interest = None, filters = None):
    if date_of_interest is None:
        date_of_interest = datetime.now()

    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
        
    forecast_dates = ForecastDates(date_of_interest)
    forecast_revenue_trackings = ForecastRevenueTrackings(forecast_dates, filters)
    forecast_working_days = ForecastNumberOfWorkingDays(date_of_interest, forecast_dates)
    
    def summarize_forecast(slug):
        clients = {}
        sponsors = {}
        cases = {}
        projects = {}
        consultants = {}
        
        def add_context(context, context_slug):
            for consultant in context['summaries']['by_consultant']:
                if consultant.slug not in consultants:
                    consultants[consultant.slug] = forecast_types.ConsultantForecast(
                        name=consultant.name,
                        slug=consultant.slug
                    )
                
                working_consultant = consultants[consultant.slug]
                setattr(working_consultant, context_slug, consultant.consulting_fee)
                setattr(working_consultant, f'{context_slug}_consulting_hours', consultant.consulting_hours)
                setattr(working_consultant, f'{context_slug}_consulting_pre_hours', consultant.consulting_pre_hours)
            
            for client in context['summaries']['by_client']:
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
                            cases[case.title] = forecast_types.CaseForecast(
                                title=case.title,
                                slug=case.slug,
                                sponsor_slug=sponsor.slug,
                                client_slug=client.slug
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
                
                wah = case_.weekly_approved_hours
                project_ = None
                for ti in case_.tracker_info:
                    if ti.kind == 'consulting':
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
                    
                    due_on = project_.due_on.date() if project_.due_on else case_.end_of_contract
                    
                    for day in range(1, days_in_month + 1):
                        date = datetime(year, month, day)
                        
                        if due_on and date.date() > due_on:
                            break
                        
                        if date in working_days_in_month:
                            hours_in_month += daily_approved_hours

                    setattr(case, labels_expected[n], hours_in_month * (project_.rate.rate / 100))
                    
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
                entity.projected = (entity.in_analysis / forecast_working_days.in_analysis_partial) * forecast_working_days.in_analysis
                
                previous_value = getattr(entity, 'one_month_ago', 0)
                two_months_ago_value = getattr(entity, 'two_months_ago', 0)
                three_months_ago_value = getattr(entity, 'three_months_ago', 0)
                
                if previous_value == 0 and two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity.expected_historical = entity.projected if entity.projected else 0
                elif two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity.expected_historical = previous_value
                elif three_months_ago_value == 0:
                    entity.expected_historical = previous_value * 0.8 + two_months_ago_value * 0.2
                else:
                    entity.expected_historical = previous_value * 0.6 + two_months_ago_value * 0.25 + three_months_ago_value * 0.15
                    
            elif slug == 'consulting_pre':
                entity.projected = (entity.in_analysis / forecast_working_days.in_analysis_partial) * forecast_working_days.in_analysis
               
               
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
        
        
        totals = {
            'in_analysis': sum(getattr(client, 'in_analysis', 0) for client in by_client),
            'one_month_ago': sum(getattr(client, 'one_month_ago', 0) for client in by_client),
            'two_months_ago': sum(getattr(client, 'two_months_ago', 0) for client in by_client),
            'three_months_ago': sum(getattr(client, 'three_months_ago', 0) for client in by_client),
        }
        if slug == 'consulting':
            totals['same_day_one_month_ago'] = sum(getattr(client, 'same_day_one_month_ago', 0) for client in by_client)
            totals['same_day_two_months_ago'] = sum(getattr(client, 'same_day_two_months_ago', 0) for client in by_client)
            totals['same_day_three_months_ago'] = sum(getattr(client, 'same_day_three_months_ago', 0) for client in by_client)
            totals['projected'] = sum(getattr(client, 'projected', 0) for client in by_client)
            totals['expected'] = sum(getattr(client, 'expected', 0) for client in by_client) 
            totals['expected_one_month_later'] = sum(getattr(client, 'expected_one_month_later', 0) for client in by_client)
            totals['expected_two_months_later'] = sum(getattr(client, 'expected_two_months_later', 0) for client in by_client)
            totals['expected_three_months_later'] = sum(getattr(client, 'expected_three_months_later', 0) for client in by_client)
            totals['expected_historical'] = sum(getattr(client, 'expected_historical', 0) for client in by_client)
            totals['in_analysis_consulting_hours'] = sum(getattr(client, 'in_analysis_consulting_hours', 0) for client in by_client)
            totals['in_analysis_consulting_pre_hours'] = sum(getattr(client, 'in_analysis_consulting_pre_hours', 0) for client in by_client)
            totals['one_month_ago_consulting_hours'] = sum(getattr(client, 'one_month_ago_consulting_hours', 0) for client in by_client)
            totals['one_month_ago_consulting_pre_hours'] = sum(getattr(client, 'one_month_ago_consulting_pre_hours', 0) for client in by_client)
            totals['two_months_ago_consulting_hours'] = sum(getattr(client, 'two_months_ago_consulting_hours', 0) for client in by_client)
            totals['two_months_ago_consulting_pre_hours'] = sum(getattr(client, 'two_months_ago_consulting_pre_hours', 0) for client in by_client)
            totals['three_months_ago_consulting_hours'] = sum(getattr(client, 'three_months_ago_consulting_hours', 0) for client in by_client)
            totals['three_months_ago_consulting_pre_hours'] = sum(getattr(client, 'three_months_ago_consulting_pre_hours', 0) for client in by_client)
            totals['same_day_one_month_ago_consulting_hours'] = sum(getattr(client, 'same_day_one_month_ago_consulting_hours', 0) for client in by_client)
            totals['same_day_two_months_ago_consulting_hours'] = sum(getattr(client, 'same_day_two_months_ago_consulting_hours', 0) for client in by_client)
            totals['same_day_three_months_ago_consulting_hours'] = sum(getattr(client, 'same_day_three_months_ago_consulting_hours', 0) for client in by_client)
            totals['in_analysis_consulting_fee_new'] = sum(getattr(client, 'in_analysis_consulting_fee_new', 0) for client in by_client)
            totals['one_month_ago_consulting_fee_new'] = sum(getattr(client, 'one_month_ago_consulting_fee_new', 0) for client in by_client)
            totals['two_months_ago_consulting_fee_new'] = sum(getattr(client, 'two_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['three_months_ago_consulting_fee_new'] = sum(getattr(client, 'three_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_one_month_ago_consulting_fee_new'] = sum(getattr(client, 'same_day_one_month_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_two_months_ago_consulting_fee_new'] = sum(getattr(client, 'same_day_two_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_three_months_ago_consulting_fee_new'] = sum(getattr(client, 'same_day_three_months_ago_consulting_fee_new', 0) for client in by_client)
        elif slug == 'consulting_pre':
            totals['in_analysis_consulting_pre_hours'] = sum(getattr(client, 'in_analysis_consulting_pre_hours', 0) for client in by_client)
            totals['one_month_ago_consulting_pre_hours'] = sum(getattr(client, 'one_month_ago_consulting_pre_hours', 0) for client in by_client)
            totals['two_months_ago_consulting_pre_hours'] = sum(getattr(client, 'two_months_ago_consulting_pre_hours', 0) for client in by_client)
            totals['three_months_ago_consulting_pre_hours'] = sum(getattr(client, 'three_months_ago_consulting_pre_hours', 0) for client in by_client)

        return {
            'slug': slug,
            'by_client': by_client,
            'by_sponsor': by_sponsor,
            'by_case': by_case,
            'by_project': by_project,
            'by_consultant': by_consultant,
            'totals': totals
        }
    
    filterable_fields = merge_filterable_fields([
        forecast_revenue_trackings.date_of_interest,
        forecast_revenue_trackings.last_day_of_last_month,
        forecast_revenue_trackings.last_day_of_two_months_ago,
        forecast_revenue_trackings.last_day_of_three_months_ago
    ])
    
    result = {
        "date_of_interest": date_of_interest,
        "dates": forecast_dates,
        
        "by_kind": {
            "consulting": summarize_forecast('consulting'),
            "consulting_pre": summarize_forecast('consulting_pre'),
            "hands_on": summarize_forecast('hands_on'),
            "squad": summarize_forecast('squad')
        },
        "filterable_fields": filterable_fields
    }
    
    summary = {
        "realized": sum(result["by_kind"][kind]["totals"]["in_analysis"] for kind in result["by_kind"]),
        "projected": result["by_kind"]["consulting"]["totals"]["projected"] + sum(result["by_kind"][kind]["totals"]["in_analysis"] for kind in result["by_kind"] if kind != "consulting"),
        "expected": result["by_kind"]["consulting"]["totals"]["expected"] + sum(result["by_kind"][kind]["totals"]["in_analysis"] for kind in result["by_kind"] if kind != "consulting"),
        "one_month_ago": sum(result["by_kind"][kind]["totals"]["one_month_ago"] for kind in result["by_kind"]),
        "two_months_ago": sum(result["by_kind"][kind]["totals"]["two_months_ago"] for kind in result["by_kind"]),
        "three_months_ago": sum(result["by_kind"][kind]["totals"]["three_months_ago"] for kind in result["by_kind"]),
        "expected_one_month_later": sum(result["by_kind"][kind]["totals"].get("expected_one_month_later", 0) for kind in result["by_kind"]),
        "expected_two_months_later": sum(result["by_kind"][kind]["totals"].get("expected_two_months_later", 0) for kind in result["by_kind"]),
        "expected_three_months_later": sum(result["by_kind"][kind]["totals"].get("expected_three_months_later", 0) for kind in result["by_kind"]),
        "in_analysis_consulting_hours": sum(result["by_kind"][kind]["totals"].get("in_analysis_consulting_hours", 0) for kind in result["by_kind"]),
        "in_analysis_consulting_pre_hours": sum(result["by_kind"][kind]["totals"].get("in_analysis_consulting_pre_hours", 0) for kind in result["by_kind"]),
        "one_month_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("one_month_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "one_month_ago_consulting_pre_hours": sum(result["by_kind"][kind]["totals"].get("one_month_ago_consulting_pre_hours", 0) for kind in result["by_kind"]),
        "two_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("two_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "two_months_ago_consulting_pre_hours": sum(result["by_kind"][kind]["totals"].get("two_months_ago_consulting_pre_hours", 0) for kind in result["by_kind"]),
        "three_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("three_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "three_months_ago_consulting_pre_hours": sum(result["by_kind"][kind]["totals"].get("three_months_ago_consulting_pre_hours", 0) for kind in result["by_kind"]),
        "same_day_one_month_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_one_month_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "same_day_two_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_two_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "same_day_three_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_three_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
    }
    
    result["summary"] = summary
    result["working_days"] = forecast_working_days
    
    return result

    