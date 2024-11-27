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
        if not worker.email or not (worker.email.endswith('@eximia.co') or worker.email.endswith('@elemarjr.com') or worker.email.endswith('@duocom.com.br'))
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
        
    stale_cases = [
        case 
        for case in cases
        if case.is_active and case.is_stale
    ]
    if len(stale_cases) > 0:
        result.append(Inconsistency(
            'Stale cases',
            f'{len(stale_cases)} case(s) have not been updated in over 30 days.'
        ))

    projects = globals.omni_models.projects.get_all().values()
    
    late_projects = [
        project for project in projects
        if project.expected_due_date and project.expected_due_date < datetime.now()
    ]
    if late_projects:
        result.append(Inconsistency(
            'Late projects',
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
            'Projects without due dates',
            f'{len(projects_without_due_dates)} project(s) have no expected due date set.'
        ))
        
    sponsors = globals.omni_models.sponsors.get_all().values()
    sponsors_without_crm_id = [
        sponsor for sponsor in sponsors
        if not sponsor.crm_id
    ]
    if sponsors_without_crm_id:
        result.append(Inconsistency(
            'Sponsors not found in CRM',
            f'{len(sponsors_without_crm_id)} sponsor(s) were not found in the CRM system.'
        ))
        
    # Build mapping of everhour project IDs to cases
    everhour_id_to_cases = {}
    for case in cases:
        if case.is_active and case.everhour_projects_ids:
            for everhour_id in case.everhour_projects_ids:
                if everhour_id not in everhour_id_to_cases:
                    everhour_id_to_cases[everhour_id] = []
                everhour_id_to_cases[everhour_id].append(case)

    # Find duplicate everhour project IDs
    duplicate_everhour_ids = {
        everhour_id: cases_list 
        for everhour_id, cases_list in everhour_id_to_cases.items()
        if len(cases_list) > 1
    }

    if duplicate_everhour_ids:
        details = []
        for everhour_id, cases_list in duplicate_everhour_ids.items():
            case_names = [case.title for case in cases_list]
            details.append(f"Everhour project ID {everhour_id} is used in cases: {', '.join(case_names)}")
            
        result.append(Inconsistency(
            'Duplicate Everhour Project IDs',
            f'{len(duplicate_everhour_ids)} Everhour project ID(s) are used in multiple cases:\n' + '\n'.join(details)
        ))
    
    for case in cases:
        if case.is_active and (not case.start_of_contract or not case.end_of_contract):
            for project in case.tracker_info:
                if project.billing and project.billing.type == 'fixed_fee' and project.budget and project.budget.period == 'general':
                    result.append(Inconsistency(
                        'Missing contract dates for fixed fee project',
                        f'The case "{case.title}" contains a fixed fee project "{project.name}" but is missing contract start/end dates. These dates are required to properly distribute the fixed fee across months.'
                    ))
        
    return result