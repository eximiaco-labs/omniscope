from ariadne import QueryType

from .insights import resolve_insights
from .timesheets import resolve_timesheet
from .datasets_set import resolve_this_week
from .datasets import resolve_datasets
from .ontology import resolve_ontology
def setup_query_for_datasets(query: QueryType):
    query.set_field("timesheet", resolve_timesheet)
    query.set_field("thisWeek", resolve_this_week)
    query.set_field("datasets", resolve_datasets)
    query.set_field("ontology", resolve_ontology)
    query.set_field("insights", resolve_insights)
