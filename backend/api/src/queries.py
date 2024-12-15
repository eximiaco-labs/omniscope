from ariadne import QueryType, gql
from pathlib import Path

from domain import setup_query_for_domain
from datasets import setup_query_for_datasets
from analytics import setup_query_for_analytics
from inconsistencies import resolve_inconsistencies
from omni_utils.decorators.cache import list_cache
from operational_summaries import setup_query_for_operational_summaries

from omni_shared import globals

BASE_DIR = Path(__file__).parent

def load_schema():
    schema_files = [
        BASE_DIR / "schema/common.graphql",
        BASE_DIR / "domain/schema.graphql", 
        BASE_DIR / "datasets/schema.graphql",
        BASE_DIR / "analytics/schema.graphql",
        BASE_DIR / "operational_summaries/schema.graphql",
        BASE_DIR / "schema.graphql",
    ]
    schemas = []
    for file in schema_files:
        with open(file, 'r') as f:
            schemas.append(f.read())
    
    return gql("\n".join(schemas))

query = QueryType()

additional_types_for_domain = setup_query_for_domain(query)
setup_query_for_datasets(query)
additional_types_for_analytics = setup_query_for_analytics(query)
additional_types_for_operational_summaries = setup_query_for_operational_summaries(query)

def resolve_cache(_, info):
    return list_cache()

def resolve_timesheet_cache(_, info, after = None, before = None):
    return globals.omni_datasets.timesheets.memory.list_cache(after, before)


query.set_field('inconsistencies', resolve_inconsistencies)
query.set_field('cache', resolve_cache)
query.set_field('timesheetCache', resolve_timesheet_cache)
query_types = [query] + additional_types_for_domain + additional_types_for_analytics + additional_types_for_operational_summaries
type_defs = load_schema()

__all__ = ['schema', 'type_defs']
