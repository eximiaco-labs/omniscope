from api.utils.fields import build_fields_map
from api.datasets.timesheets import compute_timesheet

import globals


def resolve_cases(_, info, only_actives: bool = False):
    all_cases = globals.omni_models.cases.get_all().values()

    if only_actives:
        all_cases = filter(lambda case: case.is_active, all_cases)

    all_cases = sorted(all_cases, key=lambda case: case.title)

    map_ = build_fields_map(info)

    return map(
        lambda x: _make_result_object(map_, x),
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
        return _make_result_object(map, case)
    
    return None

def _make_result_object(map, case):
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
                    'name': project.name
                }
                for project in case.tracker_info
            ]
        else:
            result['tracker'] = []


    if 'timesheets' in map:
        timesheets_map = map['timesheets']
        if 'lastSixWeeks' in timesheets_map:
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