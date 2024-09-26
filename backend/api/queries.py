from ariadne import make_executable_schema
from .queries.domain import query  # Changed this line
from backend.schema import type_defs

schema = make_executable_schema(type_defs, query)
__all__ = ['schema', 'query']
