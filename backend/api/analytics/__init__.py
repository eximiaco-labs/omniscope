from ariadne import QueryType

from .week_review import resolve_week_review


def setup_query_for_analytics(query: QueryType):
    query.set_field("weekReview", resolve_week_review)