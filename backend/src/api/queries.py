from ariadne import QueryType, gql
from pathlib import Path

from api.domain import setup_query_for_domain
from api.datasets import setup_query_for_datasets
from api.analytics import setup_query_for_analytics
from api.inconsistencies import resolve_inconsistencies

def load_schema():
    schema_files = [
        "api/schema/common.graphql",
        "api/domain/schema.graphql", 
        "api/datasets/schema.graphql",
        "api/analytics/schema.graphql",
        "api/schema.graphql",
    ]
    schemas = []
    for file in schema_files:
        with open(file, 'r') as f:
            schemas.append(f.read())
    
    return gql("\n".join(schemas))

query = QueryType()

additional_types = setup_query_for_domain(query)
setup_query_for_datasets(query)
setup_query_for_analytics(query)

query.set_field('inconsistencies', resolve_inconsistencies)
query_types = [query] + additional_types
type_defs = load_schema()

__all__ = ['schema', 'type_defs']
