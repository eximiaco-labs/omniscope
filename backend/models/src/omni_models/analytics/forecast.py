from omni_utils.helpers.dates import get_same_day_one_month_ago, get_same_day_one_month_later, get_last_day_of_month, get_working_days_in_month
from datetime import datetime
import calendar

from omni_shared import globals
from omni_models.analytics.revenue_tracking import compute_revenue_tracking


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
        
    # Dates
    
    same_day_last_month = get_same_day_one_month_ago(date_of_interest)
    last_day_of_last_month = get_last_day_of_month(same_day_last_month)
    
    same_day_two_months_ago = get_same_day_one_month_ago(same_day_last_month)
    last_day_of_two_months_ago = get_last_day_of_month(same_day_two_months_ago)
    
    same_day_three_months_ago = get_same_day_one_month_ago(same_day_two_months_ago)
    last_day_of_three_months_ago = get_last_day_of_month(same_day_three_months_ago)
    
    same_day_one_month_later = get_same_day_one_month_later(date_of_interest)
    last_day_of_one_month_later = get_last_day_of_month(same_day_one_month_later)   
    
    same_day_two_months_later = get_same_day_one_month_later(same_day_one_month_later)
    last_day_of_two_months_later = get_last_day_of_month(same_day_two_months_later)
    
    same_day_three_months_later = get_same_day_one_month_later(same_day_two_months_later)
    last_day_of_three_months_later = get_last_day_of_month(same_day_three_months_later)
    
    # Revenue tracking
    
    analysis_date_of_interest = compute_revenue_tracking(date_of_interest, filters=filters)
    
    analysis_same_day_last_month = compute_revenue_tracking(same_day_last_month, filters=filters)
    analysis_last_day_of_last_month = compute_revenue_tracking(last_day_of_last_month, filters=filters)
    
    analysis_same_day_two_months_ago = compute_revenue_tracking(same_day_two_months_ago, filters=filters)
    analysis_last_day_of_two_months_ago = compute_revenue_tracking(last_day_of_two_months_ago, filters=filters)
    
    analysis_same_day_three_months_ago = compute_revenue_tracking(same_day_three_months_ago, filters=filters)
    analysis_last_day_of_three_months_ago = compute_revenue_tracking(last_day_of_three_months_ago, filters=filters)
    
    number_of_working_days_in_analysis = len(get_working_days_in_month(date_of_interest.year, date_of_interest.month))
    number_of_working_days_in_analysis_partial = len([d for d in get_working_days_in_month(date_of_interest.year, date_of_interest.month) if d.day <= date_of_interest.day])
        
    def summarize_forecast(slug):
        clients = {}
        sponsors = {}
        cases = {}
        projects = {}
        consultants = {}
        
        def add_context(context, context_slug):
            for consultant in context['summaries']['by_consultant']:
                if consultant.slug not in consultants:
                    consultants[consultant.slug] = {
                        'name': consultant.name,
                        'slug': consultant.slug
                    }
                
                working_consultant = consultants[consultant.slug]
                working_consultant[context_slug] = consultant.consulting_fee
                working_consultant[f'{context_slug}_consulting_hours'] = consultant.consulting_hours
            
            for client in context['summaries']['by_client']:
                if client.slug not in clients:
                    clients[client.slug] = {
                        'name': client.name,
                        'slug': client.slug
                    }

                working_client = clients[client.slug]
                working_client[context_slug] = client.get_fee(slug)
                if slug == 'consulting':
                    working_client[f'{context_slug}_consulting_hours'] = client.consulting_hours
                    working_client[f'{context_slug}_consulting_fee_new'] = client.consulting_fee_new
                    
                for sponsor in client.by_sponsor:
                    if sponsor.name not in sponsors:
                        sponsors[sponsor.name] = {
                            'name': sponsor.name,
                            'slug': sponsor.slug,
                            'client_slug': client.slug
                        }
                    
                    working_sponsor = sponsors[sponsor.name]
                    working_sponsor[context_slug] = sponsor.get_fee(slug)
                    
                    if slug == 'consulting':
                        working_sponsor[f'{context_slug}_consulting_hours'] = sponsor.consulting_hours
                        working_sponsor[f'{context_slug}_consulting_fee_new'] = sponsor.consulting_fee_new
                        
                    for case in sponsor.by_case:
                        if case.title not in cases:
                            cases[case.title] = {
                                'title': case.title,
                                'slug': case.slug,
                                'sponsor_slug': sponsor.slug,
                                'client_slug': client.slug
                            }
                            
                        working_case = cases[case.title]
                        working_case[context_slug] = case.get_fee(slug)
                        
                        if slug == 'consulting':
                            working_case[f'{context_slug}_consulting_hours'] = case.consulting_hours
                            working_case['consulting_fee_new'] = case.consulting_fee_new
                        for project in case.by_project:
                            if project.name not in projects:
                                projects[project.name] = {
                                    'name': project.name,
                                    'slug': project.slug,
                                    'case_slug': case.slug
                                }
                            
                            working_project = projects[project.name]
                            working_project[context_slug] = project.get_fee(slug)
                            
                            if slug == 'consulting':
                                working_project[f'{context_slug}_consulting_hours'] = project.consulting_hours
                                working_project[f'{context_slug}_consulting_fee_new'] = project.consulting_fee_new
                                
        add_context(analysis_date_of_interest, 'in_analysis')
        add_context(analysis_last_day_of_last_month, 'one_month_ago')
        add_context(analysis_last_day_of_two_months_ago, 'two_months_ago')
        add_context(analysis_last_day_of_three_months_ago, 'three_months_ago')
        
        if slug == 'consulting':
            add_context(analysis_same_day_last_month, 'same_day_one_month_ago')
            add_context(analysis_same_day_two_months_ago, 'same_day_two_months_ago')
            add_context(analysis_same_day_three_months_ago, 'same_day_three_months_ago')
            
        def filter_items(items):
            return [
                item for item in items.values()
                if any(
                    item.get(period, 0) > 0 
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
                case_ = globals.omni_models.cases.get_by_title(case['title'])
                
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

                    case[labels_expected[n]] = hours_in_month * (project_.rate.rate / 100)
                    
                    month += 1
                    if month > 12:
                        month = 1
                        year += 1
                

            for sponsor in by_sponsor:
                for n in range(0, 4):
                    sponsor[labels_expected[n]] = sum(
                        case[labels_expected[n]] 
                        for case in by_case
                        if case['sponsor_slug'] == sponsor['slug']
                    )
                
            for client in by_client:
                for n in range(0, 4):
                    client[labels_expected[n]] = sum(
                        sponsor[labels_expected[n]] 
                        for sponsor in by_sponsor
                        if sponsor['client_slug'] == client['slug']
                    )

            for project in by_project:
                for n in range(0, 4):
                    project[labels_expected[n]] = 0
        
        def adjust_entity(entity):
            entity['in_analysis'] = entity.get('in_analysis', 0)
            entity['in_analysis_consulting_fee_new'] = entity.get('in_analysis_consulting_fee_new', 0)
            entity['one_month_ago'] = entity.get('one_month_ago', 0)
            entity['one_month_ago_consulting_fee_new'] = entity.get('one_month_ago_consulting_fee_new', 0)
            entity['two_months_ago'] = entity.get('two_months_ago', 0)
            entity['two_months_ago_consulting_fee_new'] = entity.get('two_months_ago_consulting_fee_new', 0)
            entity['three_months_ago'] = entity.get('three_months_ago', 0)
            entity['three_months_ago_consulting_fee_new'] = entity.get('three_months_ago_consulting_fee_new', 0)
            if slug == 'consulting':
                entity['in_analysis_consulting_fee_new'] = entity.get('in_analysis_consulting_fee_new', 0)
                entity['one_month_ago_consulting_fee_new'] = entity.get('one_month_ago_consulting_fee_new', 0)
                entity['two_months_ago_consulting_fee_new'] = entity.get('two_months_ago_consulting_fee_new', 0)
                entity['three_months_ago_consulting_fee_new'] = entity.get('three_months_ago_consulting_fee_new', 0)
                entity['one_month_ago'] = entity.get('one_month_ago', 0)
                entity['one_month_ago_consulting_fee_new'] = entity.get('one_month_ago_consulting_fee_new', 0)
                entity['in_analysis_consulting_hours'] = entity.get('in_analysis_consulting_hours', 0)
                entity['one_month_ago_consulting_hours'] = entity.get('one_month_ago_consulting_hours', 0)
                entity['two_months_ago_consulting_hours'] = entity.get('two_months_ago_consulting_hours', 0)
                entity['three_months_ago_consulting_hours'] = entity.get('three_months_ago_consulting_hours', 0)
                entity['same_day_one_month_ago'] = entity.get('same_day_one_month_ago', 0)
                entity['same_day_two_months_ago'] = entity.get('same_day_two_months_ago', 0)
                entity['same_day_three_months_ago'] = entity.get('same_day_three_months_ago', 0)
                entity['same_day_one_month_ago_consulting_fee_new'] = entity.get('same_day_one_month_ago_consulting_fee_new', 0)    
                entity['same_day_two_months_ago_consulting_fee_new'] = entity.get('same_day_two_months_ago_consulting_fee_new', 0)
                entity['same_day_three_months_ago_consulting_fee_new'] = entity.get('same_day_three_months_ago_consulting_fee_new', 0)
                entity['projected'] = (entity['in_analysis'] / number_of_working_days_in_analysis_partial) * number_of_working_days_in_analysis
                
                previous_value = entity.get('one_month_ago', 0)
                two_months_ago_value = entity.get('two_months_ago', 0)
                three_months_ago_value = entity.get('three_months_ago', 0)
                
                if previous_value == 0 and two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity['expected_historical'] = entity['projected'] if entity['projected'] else 0
                elif two_months_ago_value == 0 and three_months_ago_value == 0:
                    entity['expected_historical'] = previous_value
                elif three_months_ago_value == 0:
                    entity['expected_historical'] = previous_value * 0.8 + two_months_ago_value * 0.2
                else:
                    entity['expected_historical'] = previous_value * 0.6 + two_months_ago_value * 0.25 + three_months_ago_value * 0.15
               
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
            'in_analysis': sum(client.get('in_analysis', 0) for client in by_client),
            'one_month_ago': sum(client.get('one_month_ago', 0) for client in by_client),
            'two_months_ago': sum(client.get('two_months_ago', 0) for client in by_client),
            'three_months_ago': sum(client.get('three_months_ago', 0) for client in by_client),
        }
        if slug == 'consulting':
            totals['same_day_one_month_ago'] = sum(client.get('same_day_one_month_ago', 0) for client in by_client)
            totals['same_day_two_months_ago'] = sum(client.get('same_day_two_months_ago', 0) for client in by_client)
            totals['same_day_three_months_ago'] = sum(client.get('same_day_three_months_ago', 0) for client in by_client)
            totals['projected'] = sum(client.get('projected', 0) for client in by_client)
            totals['expected'] = sum(client.get('expected', 0) for client in by_client) 
            totals['expected_one_month_later'] = sum(client.get('expected_one_month_later', 0) for client in by_client)
            totals['expected_two_months_later'] = sum(client.get('expected_two_months_later', 0) for client in by_client)
            totals['expected_three_months_later'] = sum(client.get('expected_three_months_later', 0) for client in by_client)
            totals['expected_historical'] = sum(client.get('expected_historical', 0) for client in by_client)
            totals['in_analysis_consulting_hours'] = sum(client.get('in_analysis_consulting_hours', 0) for client in by_client)
            totals['one_month_ago_consulting_hours'] = sum(client.get('one_month_ago_consulting_hours', 0) for client in by_client)
            totals['two_months_ago_consulting_hours'] = sum(client.get('two_months_ago_consulting_hours', 0) for client in by_client)
            totals['three_months_ago_consulting_hours'] = sum(client.get('three_months_ago_consulting_hours', 0) for client in by_client)
            totals['same_day_one_month_ago_consulting_hours'] = sum(client.get('same_day_one_month_ago_consulting_hours', 0) for client in by_client)
            totals['same_day_two_months_ago_consulting_hours'] = sum(client.get('same_day_two_months_ago_consulting_hours', 0) for client in by_client)
            totals['same_day_three_months_ago_consulting_hours'] = sum(client.get('same_day_three_months_ago_consulting_hours', 0) for client in by_client)
            totals['in_analysis_consulting_fee_new'] = sum(client.get('in_analysis_consulting_fee_new', 0) for client in by_client)
            totals['one_month_ago_consulting_fee_new'] = sum(client.get('one_month_ago_consulting_fee_new', 0) for client in by_client)
            totals['two_months_ago_consulting_fee_new'] = sum(client.get('two_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['three_months_ago_consulting_fee_new'] = sum(client.get('three_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_one_month_ago_consulting_fee_new'] = sum(client.get('same_day_one_month_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_two_months_ago_consulting_fee_new'] = sum(client.get('same_day_two_months_ago_consulting_fee_new', 0) for client in by_client)
            totals['same_day_three_months_ago_consulting_fee_new'] = sum(client.get('same_day_three_months_ago_consulting_fee_new', 0) for client in by_client)

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
        analysis_date_of_interest,
        analysis_last_day_of_last_month,
        analysis_last_day_of_two_months_ago,
        analysis_last_day_of_three_months_ago
    ])
    
    result = {
        "date_of_interest": date_of_interest,
        "dates": {
            "in_analysis": date_of_interest,
            "same_day_one_month_ago": same_day_last_month,
            "one_month_ago": last_day_of_last_month,
            "same_day_two_months_ago": same_day_two_months_ago,
            "two_months_ago": last_day_of_two_months_ago,
            "same_day_three_months_ago": same_day_three_months_ago,
            "three_months_ago": last_day_of_three_months_ago,
            "same_day_one_month_later": same_day_one_month_later,
            "one_month_later": last_day_of_one_month_later,
            "same_day_two_months_later": same_day_two_months_later,
            "two_months_later": last_day_of_two_months_later,
            "same_day_three_months_later": same_day_three_months_later,
            "three_months_later": last_day_of_three_months_later
        },
        
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
        "one_month_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("one_month_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "two_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("two_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "three_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("three_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "same_day_one_month_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_one_month_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "same_day_two_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_two_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
        "same_day_three_months_ago_consulting_hours": sum(result["by_kind"][kind]["totals"].get("same_day_three_months_ago_consulting_hours", 0) for kind in result["by_kind"]),
    }
    
    result["summary"] = summary
    working_days = {
        "in_analysis": number_of_working_days_in_analysis,
        "in_analysis_partial": number_of_working_days_in_analysis_partial,
        "one_month_ago": len(get_working_days_in_month(same_day_last_month.year, same_day_last_month.month)),
        "same_day_one_month_ago": len([d for d in get_working_days_in_month(same_day_last_month.year, same_day_last_month.month) if d.day <= date_of_interest.day]),
        "two_months_ago": len(get_working_days_in_month(same_day_two_months_ago.year, same_day_two_months_ago.month)),
        "same_day_two_months_ago": len([d for d in get_working_days_in_month(same_day_two_months_ago.year, same_day_two_months_ago.month) if d.day <= date_of_interest.day]),
        "three_months_ago": len(get_working_days_in_month(same_day_three_months_ago.year, same_day_three_months_ago.month)),
        "same_day_three_months_ago": len([d for d in get_working_days_in_month(same_day_three_months_ago.year, same_day_three_months_ago.month) if d.day <= date_of_interest.day]),
        "one_month_later": len(get_working_days_in_month(same_day_one_month_later.year, same_day_one_month_later.month)),
        "same_day_one_month_later": len([d for d in get_working_days_in_month(same_day_one_month_later.year, same_day_one_month_later.month) if d.day <= date_of_interest.day]),
        "two_months_later": len(get_working_days_in_month(same_day_two_months_later.year, same_day_two_months_later.month)),
        "same_day_two_months_later": len([d for d in get_working_days_in_month(same_day_two_months_later.year, same_day_two_months_later.month) if d.day <= date_of_interest.day]),
        "three_months_later": len(get_working_days_in_month(same_day_three_months_later.year, same_day_three_months_later.month)),
        "same_day_three_months_later": len([d for d in get_working_days_in_month(same_day_three_months_later.year, same_day_three_months_later.month) if d.day <= date_of_interest.day]),
    }
    
    result["working_days"] = working_days
    
    return result


    