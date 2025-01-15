from ariadne import QueryType, ObjectType
from .models import AccountManager, ConsultantOrEngineer
from timesheet.service import compute_timesheet
from utils.fields import build_fields_map

from omni_shared import globals
from omni_models.domain import WorkerKind
from core.decorators import collection

query = QueryType()
team = ObjectType("Team")
account_manager = ObjectType("AccountManager")
consultant_or_engineer = ObjectType("ConsultantOrEngineer")

team_resolvers = [ query, team, account_manager, consultant_or_engineer ]

@query.field("team")
def resolve_team(*_):
    return {}

@account_manager.field("timesheet")
def resolve_account_manager_timesheet(obj, info, slug: str = None, filters = None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'AccountManagerName',
            'selected_values': [obj['name']]
        }
    ] + filters
    
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, client_filters)
    model_dump = result.model_dump()
    print(model_dump)
    return model_dump

@consultant_or_engineer.field("timesheet")
def resolve_consultant_or_engineer_timesheet(obj, info, slug: str = None, filters = None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'WorkerName',
            'selected_values': [obj['name']]
        }
    ] + filters
    
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, client_filters)
    model_dump = result.model_dump()
    print(model_dump)
    return model_dump

def convert_worker_to_account_manager(worker):
    """Convert a Worker instance to an AccountManager instance"""
    return AccountManager(
        id=worker.id,
        slug=worker.slug,
        name=worker.name,
        email=worker.email or "",
        ontology_url=str(worker.ontology_url or ""),
        photo_url=str(worker.photo_url or ""),
        is_recognized=worker.is_recognized,
        position=worker.position,
        errors=worker.errors
    )

def convert_worker_to_consultant_or_engineer(worker):
    """Convert a Worker instance to a ConsultantOrEngineer instance"""
    return ConsultantOrEngineer(
        id=worker.id,
        slug=worker.slug,
        name=worker.name,
        email=worker.email or "",
        ontology_url=str(worker.ontology_url or ""),
        photo_url=str(worker.photo_url or ""),
        is_recognized=worker.is_recognized,
        position=worker.position,
        errors=worker.errors,
        is_ontology_author=worker.is_ontology_author,
        is_insights_author=worker.is_insights_author,
        is_time_tracker_worker=worker.is_time_tracker_worker,
        is_special_projects_worker=worker.is_special_projects_worker
    )

@team.field("accountManagers")
@collection
def resolve_team_account_managers(obj, info):
    source = globals.omni_models.workers.get_all(WorkerKind.ACCOUNT_MANAGER).values()
    return [convert_worker_to_account_manager(worker) for worker in source]

@team.field("accountManager")
def resolve_team_account_manager(obj, info, id: str = None, slug: str = None):
    if id is not None:
        worker = globals.omni_models.workers.get_by_id(int(id))
    elif slug is not None:
        worker = globals.omni_models.workers.get_by_slug(slug)
    else:
        return None
        
    if not worker or worker.kind != WorkerKind.ACCOUNT_MANAGER:
        return None
        
    return convert_worker_to_account_manager(worker).model_dump()

@team.field("consultantsOrEngineers")
@collection
def resolve_team_consultants_or_engineers(obj, info):
    source = [
        worker for worker in globals.omni_models.workers.get_all().values()
        if worker.kind == WorkerKind.CONSULTANT
    ]
    return [convert_worker_to_consultant_or_engineer(worker) for worker in source]

@team.field("consultantOrEngineer")
def resolve_team_consultant_or_engineer(obj, info, id: str = None, slug: str = None):
    if id is not None:
        worker = globals.omni_models.workers.get_by_id(int(id))
    elif slug is not None:
        worker = globals.omni_models.workers.get_by_slug(slug)
    else:
        return None
        
    if not worker or worker.kind != WorkerKind.CONSULTANT:
        return None
        
    return convert_worker_to_consultant_or_engineer(worker).model_dump()