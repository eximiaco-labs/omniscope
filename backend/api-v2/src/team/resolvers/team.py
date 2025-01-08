from ariadne import QueryType, ObjectType
from ..models import (
    get_account_managers, get_account_manager_by_id, get_account_manager_by_slug,
    get_consultants, get_consultant_by_id, get_consultant_by_slug,
    get_engineers, get_engineer_by_id, get_engineer_by_slug
)
from core.decorators import collection

query = QueryType()
team = ObjectType("Team")

@query.field("team")
def resolve_team(*_):
    return {}

@team.field("accountManagers")
@collection
def resolve_team_account_managers(obj, info):
    return get_account_managers()

@team.field("accountManager")
def resolve_team_account_manager(obj, info, id: str = None, slug: str = None):
    if id is not None:
        result = get_account_manager_by_id(id)
    elif slug is not None:
        result = get_account_manager_by_slug(slug)
    else:
        return None
        
    return result.model_dump() if result else None

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