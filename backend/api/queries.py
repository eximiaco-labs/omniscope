from ariadne import QueryType

from .domain import setup_query_for_domain
from .datasets import setup_query_for_datasets
from .inconsistencies import resolve_inconsistencies

query = QueryType()

setup_query_for_domain(query)
setup_query_for_datasets(query)
query.set_field('inconsistencies', resolve_inconsistencies)

__all__ = ['query']
