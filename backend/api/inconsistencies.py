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


    cases = globals.omni_models.cases.get_all().values()
    projects_with_hours_recorded_without_case = sorted(
        [
            case
            for case in cases
            if not case.has_description and case.is_active and case.has_client
        ], key=lambda case: case.title
    )

    if len(projects_with_hours_recorded_without_case) > 0:
        result.append(Inconsistency(
            'Projects with hours recorded without "case"',
            f'{len(projects_with_hours_recorded_without_case)} projects had hours listed but did not have a formal description in a "case"'
        ))

    return result