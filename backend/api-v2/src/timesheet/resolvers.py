from utils.fields import build_fields_map
from ariadne import QueryType

from .service import compute_timesheet

query = QueryType()

@query.field("timesheet")
def resolve_timesheet(_, info, slug: str, filters = None):
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, filters)
    return result.model_dump() 