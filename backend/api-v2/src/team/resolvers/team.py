from ariadne import QueryType, ObjectType
from ..models import AccountManager
from ..models import (
    get_account_managers, get_account_manager_by_id, get_account_manager_by_slug,
    get_consultants, get_consultant_by_id, get_consultant_by_slug,
    get_engineers, get_engineer_by_id, get_engineer_by_slug
)

from omni_shared import globals
from omni_models.domain import WorkerKind
from core.decorators import collection

query = QueryType()
team = ObjectType("Team")

@query.field("team")
def resolve_team(*_):
    return {}

def convert_worker_to_account_manager(worker):
    """Convert a Worker instance to an AccountManager instance"""
    return AccountManager(
        id=worker.id,
        slug=worker.slug,
        name=worker.name,
        email=worker.email or "",
        ontology_url=str(worker.ontology_url or ""),
        photo_url=str(worker.photo_url or "")
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

@team.field("consultants")
@collection
def resolve_team_consultants(obj, info):
    return get_consultants()

@team.field("consultant")
def resolve_team_consultant(obj, info, id: str = None, slug: str = None):
    if id is not None:
        result = get_consultant_by_id(id)
    elif slug is not None:
        result = get_consultant_by_slug(slug)
    else:
        return None
        
    return result.model_dump() if result else None

@team.field("engineers")
@collection
def resolve_team_engineers(obj, info):
    return get_engineers()

@team.field("engineer")
def resolve_team_engineer(obj, info, id: str = None, slug: str = None):
    if id is not None:
        result = get_engineer_by_id(id)
    elif slug is not None:
        result = get_engineer_by_slug(slug)
    else:
        return None
        
    return result.model_dump() if result else None 