import globals

class Inconsistency:
    def __init__(self, title: str, description: str = None) -> None:
        self.title = title
        self.description = description

def resolve_inconsistencies(_, info) -> list[Inconsistency]:
    result: list[Inconsistency] = []

    workers = globals.omni_models.workers.get_all()
    unrecognized_workers = sorted(
        [
            worker
            for worker in workers.values()
            if not worker.is_recognized
        ], key=lambda worker: worker.name
    )

    if len(unrecognized_workers) > 0:
        result.append(Inconsistency(
            'Unrecognized Workers',
            f'{len(unrecognized_workers)} worker(s) do not yet have a profile in the ontology.'
        ))


    return result