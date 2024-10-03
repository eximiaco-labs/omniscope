from ariadne import QueryType

from .domain import setup_query_for_domain
from .datasets import setup_query_for_datasets

query = QueryType()

setup_query_for_domain(query)
setup_query_for_datasets(query)

__all__ = ['query']
