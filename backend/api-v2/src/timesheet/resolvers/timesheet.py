from graphql import GraphQLResolveInfo
from utils.fields import build_fields_map

from ..service import compute_timesheet

def resolve_timesheet(_, info: GraphQLResolveInfo, slug: str, filters = None):
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, filters)
    return result.dict() 