from ariadne import QueryType

from models.domain import WorkerKind

import globals

query = QueryType()


@query.field("accountManagers")
def resolve_account_managers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.ACCOUNT_MANAGER
    ]


@query.field("consultantsAndEngineers")
def resolve_consultants_and_engineers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.CONSULTANT
    ]

@query.field("clients")
def resolve_clients(_, info):
    all_clients = sorted(globals.omni_models.clients.get_all().values(), key=lambda client: client.name)
    return all_clients

@query.field("sponsors")
def resolve_sponsors(_, info):
    all_sponsors = sorted(globals.omni_models.sponsors.get_all().values(), key=lambda sponsor: sponsor.name)
    return all_sponsors
