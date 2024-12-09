from datasets.timesheets import compute_timesheet
from utils.fields import build_fields_map
from omni_models.analytics.forecast import compute_forecast
from omni_shared import globals

from ariadne import ObjectType

client_type = ObjectType('Client')

def resolve_clients(_, info, account_manager_name=None, account_manager_slug=None):
    all_clients = sorted(globals.omni_models.clients.get_all().values(), key=lambda client: client.name)
    if account_manager_name:
        all_clients = [client for client in all_clients if client.account_manager and client.account_manager.name == account_manager_name]
    elif account_manager_slug:
        all_clients = [client for client in all_clients if client.account_manager and client.account_manager.slug == account_manager_slug]
    
    map_ = build_fields_map(info)
    return map(
        lambda x: _make_result_object(map_, x),
        all_clients
    )

def resolve_client(_, info, id=None, slug=None):
    client = None
    if id is not None:
        client = globals.omni_models.clients.get_by_id(id)
    elif slug is not None:
        client = globals.omni_models.clients.get_by_slug(slug)
    
    if client is not None:
        map = build_fields_map(info)
        return _make_result_object(map, client)
    
    return None

def resolve_client_timesheet(client, info, slug, filters=None):
    if filters is None:
        filters = []
    
    client_filters = [
        {
            'field': 'ClientName',
            'selected_values': [client["name"]]
        }
    ] + filters
    
    map_ = build_fields_map(info)
    return compute_timesheet(map_, slug, filters=client_filters)

def _make_result_object(map, client):
    result = {**client.__dict__}
    
    # Add all properties
    for prop in dir(client):
        if not prop.startswith('_') and prop not in result:
            result[prop] = getattr(client, prop)

    if 'timesheets' in map:
        timesheets_map = map['timesheets']
        if 'lastSixWeeks' in timesheets_map:
            last_six_weeks_map = timesheets_map['lastSixWeeks']
            filters = [
                {
                    'field': 'ClientName',
                    'selected_values': [client.name]
                }
            ]
            computed_timesheet = compute_timesheet(last_six_weeks_map, 'last-six-weeks', filters=filters)
            result['timesheets'] = {
                'last_six_weeks': computed_timesheet
            }   

    return result

def resolve_client_forecast(client, info, date_of_interest=None, filters=None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'ClientName',
            'selected_values': [client["name"]]
        }
    ] + filters
    
    return compute_forecast(date_of_interest, filters=client_filters)
    
