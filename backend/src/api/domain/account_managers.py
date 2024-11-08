from api.datasets.timesheets import compute_timesheet
from api.utils.fields import build_fields_map
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