from ariadne import QueryType, ObjectType
from ..models import (
    get_account_managers, get_account_manager_by_id, get_account_manager_by_slug,
    get_consultants, get_consultant_by_id, get_consultant_by_slug,
    get_engineers, get_engineer_by_id, get_engineer_by_slug
)
from ..schema.filters import process_collection, FilterInput, SortInput, PaginationInput

query = QueryType()
team = ObjectType("Team")

@query.field("team")
def resolve_team(*_):
    return {}

@team.field("accountManagers")
def resolve_team_account_managers(obj, info, filter: dict = None, sort: dict = None, pagination: dict = None):
    items = get_account_managers()
    filter_input = FilterInput.model_validate(filter) if filter else None
    sort_input = SortInput.model_validate(sort) if sort else None
    pagination_input = PaginationInput.model_validate(pagination) if pagination else None
    
    result = process_collection(
        items,
        filter_input=filter_input,
        sort_input=sort_input,
        pagination_input=pagination_input
    )
    
    return result.model_dump()

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
def resolve_team_consultants(obj, info, filter: dict = None, sort: dict = None, pagination: dict = None):
    items = get_consultants()
    filter_input = FilterInput.model_validate(filter) if filter else None
    sort_input = SortInput.model_validate(sort) if sort else None
    pagination_input = PaginationInput.model_validate(pagination) if pagination else None
    
    result = process_collection(
        items,
        filter_input=filter_input,
        sort_input=sort_input,
        pagination_input=pagination_input
    )
    
    return result.model_dump()

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
def resolve_team_engineers(obj, info, filter: dict = None, sort: dict = None, pagination: dict = None):
    items = get_engineers()
    filter_input = FilterInput.model_validate(filter) if filter else None
    sort_input = SortInput.model_validate(sort) if sort else None
    pagination_input = PaginationInput.model_validate(pagination) if pagination else None
    
    result = process_collection(
        items,
        filter_input=filter_input,
        sort_input=sort_input,
        pagination_input=pagination_input
    )
    
    return result.model_dump()

@team.field("engineer")
def resolve_team_engineer(obj, info, id: str = None, slug: str = None):
    if id is not None:
        result = get_engineer_by_id(id)
    elif slug is not None:
        result = get_engineer_by_slug(slug)
    else:
        return None
        
    return result.model_dump() if result else None 