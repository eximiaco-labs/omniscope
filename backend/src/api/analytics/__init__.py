from ariadne import QueryType

from .week_review import resolve_week_review
from .timeliness_review import resolve_timeliness_review
from .approved_vs_actual import resolve_approved_vs_actual

def setup_query_for_analytics(query: QueryType):
    query.set_field("weekReview", resolve_week_review)
    query.set_field("timelinessReview", resolve_timeliness_review)
    query.set_field("approvedVsActual", resolve_approved_vs_actual)
