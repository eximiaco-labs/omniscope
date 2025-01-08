from omni_models.domain import WorkerKind
from omni_shared import globals

query = {
    "teams": lambda *_: [
        {"id": worker.id, "name": worker.name}
        for worker in globals.omni_models.workers.get_all().values()
    ],
    "accountManagers": lambda *_: [
        {"id": worker.id, "name": worker.name}
        for worker in globals.omni_models.workers.get_all().values()
        if worker.kind == WorkerKind.ACCOUNT_MANAGER
    ],
    "consultants": lambda *_: [
        {"id": worker.id, "name": worker.name}
        for worker in globals.omni_models.workers.get_all().values()
        if worker.kind == WorkerKind.CONSULTANT
    ],
    "engineers": lambda *_: [
        {"id": worker.id, "name": worker.name}
        for worker in globals.omni_models.workers.get_all().values()
        if worker.kind == WorkerKind.ENGINEER
    ]
} 