from ariadne import QueryType, make_executable_schema

from .domain import setup_query_for_domain
from .datasets import setup_query_for_datasets
from .analytics import setup_query_for_analytics
from .inconsistencies import resolve_inconsistencies
from .mutations import mutation

query = QueryType()

setup_query_for_domain(query)
setup_query_for_datasets(query)
setup_query_for_analytics(query)
query.set_field('inconsistencies', resolve_inconsistencies)

__all__ = ['schema']
