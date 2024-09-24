from ariadne import QueryType
import globals

query = QueryType()

@query.field("workers")
def resolve_workers(_, info):
    return globals.omni_models.workers.get_all().values()