from utils.fields import build_fields_map
from datasets.timesheets import compute_timesheet
from omni_models.analytics.forecast import compute_forecast
from omni_shared import globals


def resolve_cases(_, info, only_actives: bool = False):
    all_cases = globals.omni_models.cases.get_all().values()
    map_ = build_fields_map(info)

    return compute_cases(all_cases, map_, only_actives)
    
def compute_cases(all_cases, map_, only_actives: bool = False):
    if only_actives:
        all_cases = filter(lambda case: case.is_active, all_cases)

    all_cases = sorted(all_cases, key=lambda case: case.title)

    return map(
        lambda x: build_case_dictionary(map_, x),
        all_cases
    )

def resolve_case(_, info, id=None, slug=None):
    case = None
    if id is not None:
        case = globals.omni_models.cases.get_by_id(id)
        if case is None:
            case = globals.omni_models.cases.get_by_slug(id)
    elif slug is not None:
        case = globals.omni_models.cases.get_by_slug(slug)
        if case is None:
            case = globals.omni_models.cases.get_by_id(slug)
    
    if case is not None:
        map = build_fields_map(info)
        return build_case_dictionary(map, case)
    
    return None

def build_case_dictionary(map, case):
    result = {**case.__dict__}
    
    # Add all properties
    for prop in dir(case):
        if not prop.startswith('_') and prop not in result:
            result[prop] = getattr(case, prop)


    if 'client' in map:
        if case.client_id:
            result['client'] = globals.omni_models.clients.get_by_id(case.client_id)

    if 'sponsor' in map:
        result['sponsor'] = case.sponsor

    if 'tracker' in map:
        if case.tracker_info:
            result['tracker'] = [
                {
                    'id': project.id,
                    'name': project.name,
                    'kind': project.kind,
                    'due_on': project.due_on,
                    'budget': {
                        'period': project.budget.period,
                        'hours': project.budget.hours
                    } if project.budget else None
                }
                for project in case.tracker_info
            ]
        else:
            result['tracker'] = []


    if 'timesheets' in map:
        timesheets_map = map['timesheets']
        if 'lastSixWeeks' in timesheets_map:
            from datasets.timesheets import compute_timesheet
            last_six_weeks_map = timesheets_map['lastSixWeeks']
            filters = [
                {
                    'field': 'CaseTitle',
                    'selected_values': [case.title]
                }
            ]
            computed_timesheet = compute_timesheet(last_six_weeks_map, 'last-six-weeks', filters=filters)
            result['timesheets'] = {
                'last_six_weeks': computed_timesheet
            }

    return result

def resolve_case_timesheet(case, info, slug, filters=None):
    if filters is None:
        filters = []
        
    title = case["title"]
    
    client_filters = [
        {
            'field': 'CaseTitle',
            'selected_values': [title]
        }
    ] + filters
    
    map_ = build_fields_map(info)
    return compute_timesheet(map_, slug, filters=client_filters)

def resolve_case_forecast(case, info, date_of_interest=None, filters=None):
    if filters is None:
        filters = []
        
    case_filters = [
        {
            'field': 'CaseTitle', 
            'selected_values': [case["title"]]
        }
    ] + filters
    
    return compute_forecast(date_of_interest, filters=case_filters)
