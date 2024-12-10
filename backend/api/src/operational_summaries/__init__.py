from ariadne import QueryType, ObjectType

from .staleliness import resolve_staleliness

def setup_query_for_operational_summaries(query: QueryType):
    query.set_field('staleliness', resolve_staleliness)
    return []
