from ariadne import QueryType, ObjectType
from core.decorators import collection
from omni_shared import globals
from omni_utils.decorators import cache
from .models import User, CacheItem, Inconsistency

query = QueryType()
admin = ObjectType("Admin")
user = ObjectType("User")

admin_resolvers = [query, admin, user]

@query.field("admin")
def resolve_admin(*_):
    return {}

@admin.field("users")
@collection
def resolve_admin_users(obj, info):
    source = globals.omni_models.workers.get_all().values()
    users = [
        worker
        for worker in source
        if worker.email != None
    ]
    return [User.from_domain(worker) for worker in users]

@admin.field("user")
def resolve_admin_user(obj, info, id: str = None, slug: str = None, email: str = None):
    if id is not None:
        worker = globals.omni_models.workers.get_by_id(int(id))
    elif slug is not None:
        worker = globals.omni_models.workers.get_by_slug(slug)
    elif email is not None:
        worker = globals.omni_models.workers.get_by_email(email)
    else:
        return None
        
    if not worker:
        return None
        
    return User.from_domain(worker).model_dump()

@admin.field("inconsistencies")
@collection
def resolve_admin_inconsistencies(obj, info):
    clients = globals.omni_models.clients.get_all().values()
    
    inconsistences = []
    for client in clients:
        if client.account_manager is None:
            inconsistences.append(Inconsistency(kind="client_without_account_manager", entity_kind="client", entity=str(client.id), description=f"Client {client.name} has no account manager"))
            
    cases = globals.omni_models.cases.get_all().values()
    for case in cases:
        if case.is_active:
            if case.ontology_url is None:
                inconsistences.append(Inconsistency(kind="case_without_ontology", entity_kind="case", entity=str(case.id), description=f"Case {case.title} has no ontology URL"))
            elif case.tracker_info is None:
                inconsistences.append(Inconsistency(kind="case_without_tracker_info", entity_kind="case", entity=str(case.id), description=f"Case {case.title} has no tracker info"))
            
    return inconsistences

@admin.field("cacheItems")
@collection
def resolve_admin_cache_items(obj, info):
    all_cache_items = cache.list_cache()
    return [CacheItem(key=item["key"], created_at=item["created_at"]) for item in all_cache_items]

@admin.field("cacheItem")
def resolve_admin_cache_item(obj, info, key: str):
    all_cache_items = cache.list_cache()
    item = next((item for item in all_cache_items if item["key"] == key), None)
    if item is None:   
        return None
    return CacheItem(key=item["key"], created_at=item["created_at"])
