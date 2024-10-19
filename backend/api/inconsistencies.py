from datetime import datetime
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

    workers_without_email_or_with_invalid_email = [
        worker for worker in workers.values()
        if not worker.email or not (worker.email.endswith('@eximia.co') or worker.email.endswith('@elemarjr.com'))
    ]
    if len(workers_without_email_or_with_invalid_email) > 0:
        result.append(Inconsistency(
            'Workers without email or with invalid email',
            f'{len(workers_without_email_or_with_invalid_email)} worker(s) do not have an email or have an email that is not recognized.'
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
            'Everhour projects with hours recorded without "case"',
            f'{len(projects_with_hours_recorded_without_case)} Everhour projects had hours listed but did not have a formal description in a "case"'
        ))

    projects = globals.omni_models.projects.get_all().values()
    
    late_projects = [
        project for project in projects
        if project.expected_due_date and project.expected_due_date < datetime.now()
    ]
    if late_projects:
        result.append(Inconsistency(
            'Late Projects',
            f'{len(late_projects)} project(s) are past their expected due date.'
        ))

    projects_without_tasks = [
        project for project in projects
        if project.number_of_tasks == 0
    ]
    if projects_without_tasks:
        result.append(Inconsistency(
            'Projects Without Tasks',
            f'{len(projects_without_tasks)} project(s) have no tasks assigned.'
        ))

    projects_without_due_dates = [
        project for project in projects
        if not project.expected_due_date
    ]
    if projects_without_due_dates:
        result.append(Inconsistency(
            'Projects Without Due Dates',
            f'{len(projects_without_due_dates)} project(s) have no expected due date set.'
        ))


    return result