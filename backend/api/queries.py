from ariadne import QueryType

from models.domain import WorkerKind

import globals

query = QueryType()


@query.field("accountManagers")
def resolve_account_managers(_, info):
    all_workers = globals.omni_models.workers.get_all().values()
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.ACCOUNT_MANAGER
    ]


@query.field("consultantsAndEngineers")
def resolve_consultants_and_engineers(_, info):
    all_workers = globals.omni_models.workers.get_all().values()
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.CONSULTANT
    ]
