from datetime import datetime
from datasets.timesheets import compute_timesheet
from omni_models.domain.cases import compute_cases
from utils.fields import build_fields_map
from omni_models.analytics.timeliness_review import compute_timeliness_review
from omni_models.domain import WorkerKind

import globals

def resolve_consultants_and_engineers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.CONSULTANT
    ]

def resolve_consultant_or_engineer(_, info, id=None, slug=None):
    if id is not None:
        worker = globals.omni_models.workers.get_by_id(id)
    elif slug is not None:
        worker = globals.omni_models.workers.get_by_slug(slug)
    else:
        return None
    
    if worker and worker.kind == WorkerKind.CONSULTANT:
        return worker
    return None


def resolve_consultant_or_engineer_timesheet(consultant_or_engineer, info, slug, filters=None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'WorkerName',
            'selected_values': [consultant_or_engineer.name]
        }
    ] + filters
    
    map_ = build_fields_map(info)
    return compute_timesheet(map_, slug, filters=client_filters)

def resolve_consultant_or_engineer_timeliness_review(consultant_or_engineer, info, date_of_interest=None, filters=None):
    if filters is None:
        filters = []
        
    if not date_of_interest:
        date_of_interest = datetime.now().date()
        
    client_filters = [
        {
            'field': 'WorkerName',
            'selected_values': [consultant_or_engineer.name]
        }
    ] + filters
    
    return compute_timeliness_review(date_of_interest, filters=client_filters)


# def resolve_account_manager_cases(account_manager, info, only_actives: bool = False):
#     all_cases = globals.omni_models.cases.get_all().values()
    
#     filtered_cases = [
#         case for case in all_cases
#         if case.client_id and (
#             client := globals.omni_models.clients.get_by_id(case.client_id)
#         ) and client.account_manager and client.account_manager.slug == account_manager.slug
#     ]

#     map_ = build_fields_map(info)
#     return compute_cases(filtered_cases, map_, only_actives)