from ariadne import QueryType, ObjectType

from .staleliness import resolve_staleliness
from .allocation import resolve_allocation
def setup_query_for_operational_summaries(query: QueryType):
    query.set_field('staleliness', resolve_staleliness)
    query.set_field('allocation', resolve_allocation)
    return []
