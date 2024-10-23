from models.domain import WorkerKind
import globals


def resolve_consultants_and_engineers(_, info):
    all_workers = sorted(globals.omni_models.workers.get_all().values(), key=lambda worker: worker.name)
    return [
        worker
        for worker in all_workers
        if worker.kind == WorkerKind.CONSULTANT
    ]

def resolve_consultant_or_engineer(_, info, id=None, slug=None):
    if id is not None:
        worker = globals.omni_models.workers.get_by_id(id)
    elif slug is not None:
        worker = globals.omni_models.workers.get_by_slug(slug)
    else:
        return None
    
    if worker and worker.kind == WorkerKind.CONSULTANT:
        return worker
    return None