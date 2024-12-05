from backend.src.api.datasets.timesheets import compute_timesheet
import globals
from api.utils.fields import build_fields_map, get_requested_fields_from

def _add_client(original):
    result = dict(original)
    if 'client_id' in result and result['client_id'] is not None:
        client = globals.omni_models.clients.get_by_id(result['client_id'])
        if client:
            result['client'] = client
    return result
    

def resolve_sponsors(_, info):
    all_sponsors = sorted(globals.omni_models.sponsors.get_all().values(), key=lambda sponsor: sponsor.name)
    fields = get_requested_fields_from(info)
    if 'client' in fields:
        all_sponsors = list(map(_add_client, all_sponsors))

    return all_sponsors

def resolve_sponsor(_, info, slug=None):
    if slug is not None:
        result =  globals.omni_models.sponsors.get_by_slug(slug)
        fields = get_requested_fields_from(info)
        if 'client' in fields:
            result = _add_client(result)
        return result

    return None

def resolve_sponsor_timesheet(sponsor, info, slug, filters=None):
    if filters is None:
        filters = []

    sponsor_name = sponsor["name"] if isinstance(sponsor, dict) else sponsor.name
    
    client_filters = [
        {
            'field': 'Sponsor',
            'selected_values': [sponsor_name]
        }
    ] + filters
    
    map_ = build_fields_map(info)
    return compute_timesheet(map_, slug, filters=client_filters)