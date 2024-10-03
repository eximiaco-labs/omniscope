from ariadne import QueryType

from .timesheets import resolve_timesheet

def setup_query_for_datasets(query: QueryType):
    query.set_field("timesheet", resolve_timesheet)