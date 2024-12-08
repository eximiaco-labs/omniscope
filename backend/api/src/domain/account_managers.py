from api.datasets.timesheets import compute_timesheet
from api.domain.cases import compute_cases
from api.domain.active_deals import compute_active_deals

from api.utils.fields import build_fields_map

from models.analytics.forecast import compute_forecast
from models.domain import WorkerKind
import globals


def resolve_account_managers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.ACCOUNT_MANAGER
    ]

def resolve_account_manager(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.workers.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.workers.get_by_slug(slug)
    return None

def resolve_account_manager_timesheet(account_manager, info, slug, filters=None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'AccountManagerName',
            'selected_values': [account_manager.name]
        }
    ] + filters
    
    map_ = build_fields_map(info)
    return compute_timesheet(map_, slug, filters=client_filters)

def resolve_account_manager_cases(account_manager, info, only_actives: bool = False):
    all_cases = globals.omni_models.cases.get_all().values()
    
    filtered_cases = [
        case for case in all_cases
        if case.client_id and (
            client := globals.omni_models.clients.get_by_id(case.client_id)
        ) and client.account_manager and client.account_manager.slug == account_manager.slug
    ]

    map_ = build_fields_map(info)
    return compute_cases(filtered_cases, map_, only_actives)

def resolve_account_manager_active_deals(account_manager, info):
    return compute_active_deals(account_manager.slug)

def resolve_account_manager_forecast(account_manager, info, date_of_interest=None, filters=None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'AccountManagerName',
            'selected_values': [account_manager.name]
        }
    ] + filters
    
    return compute_forecast(date_of_interest, filters=client_filters)
