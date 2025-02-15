from ariadne import QueryType, ObjectType
from core.decorators import collection
from omni_shared import globals
from omni_utils.decorators import cache
from .models import User, CacheItem

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
