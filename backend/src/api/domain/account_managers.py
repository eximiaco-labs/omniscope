from models.domain import WorkerKind
import globals


def resolve_account_managers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.ACCOUNT_MANAGER
    ]

def resolve_account_manager(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.workers.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.workers.get_by_slug(slug)
    return None