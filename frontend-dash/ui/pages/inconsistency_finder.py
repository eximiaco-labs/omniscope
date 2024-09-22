import dash
import globals

from dash import html
import ui.components.base.title as title
import dash_bootstrap_components as dbc

dash.register_page(__name__, title='Omniscope')


def render_unrecognized_workers():
    workers = globals.omni.workers.get_all()

    unrecognized_workers = sorted(
        [
            worker
            for worker in workers.values()
            if not worker.is_recognized
        ], key=lambda worker: worker.name
    )

    if len(unrecognized_workers) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Name'),
            html.Th('Pipedrive'),
            html.Th('Todoist'),
            html.Th('Everhour'),
            html.Th('Insights'),
            html.Th('Ontology'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(worker.name),
                    html.Td('X' if worker.pipedrive_user_id else ''),
                    html.Td('X' if worker.todoist_user_id else ''),
                    html.Td('X' if worker.tracker_info and worker.tracker_info.id else ''),
                    html.Td('X' if worker.insights_user_id else ''),
                    html.Td('X' if worker.ontology_user_id else ''),
                ]
            )
            for worker in unrecognized_workers
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Unrecognized Workers'),
        table
    ]


def render_cases_with_no_everhour_project():
    cases = globals.omni.cases.get_all().values()

    cases_with_no_everhour = sorted(
        [
            case
            for case in cases
            if not case.has_everhour_projects_ids and case.is_active
        ], key=lambda case: case.title
    )

    if len(cases_with_no_everhour) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Title'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(case.title),
                ]
            )
            for case in cases_with_no_everhour
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Case with no everhour project'),
        table
    ]


def render_everhour_projects_with_no_case():
    cases = globals.omni.cases.get_all().values()
    # ap = globals.datasets.timesheets.get_last_six_weeks().data

    everhour_projects_with_no_case = sorted(
        [
            case
            for case in cases
            if not case.has_description and case.is_active and case.has_client
        ], key=lambda case: case.title
    )

    if len(everhour_projects_with_no_case) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Title'),
            html.Th('Everhour Id'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(case.title, href=case.omni_url)),
                    html.Td(case.everhour_projects_ids[0]),
                ]
            )
            for case in everhour_projects_with_no_case
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Everhour projects with no case'),
        table
    ]


def render_unrecognized_clients():
    clients = globals.omni.clients.get_all().values()
    unrecognized_clients = [
        c
        for c in clients
        if not c.is_recognized
    ]

    if len(unrecognized_clients) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Name'),
            html.Th('Everhour Id'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(client.name, href=client.omni_url)),
                    html.Td(client.tracker_info[0].id),
                ]
            )
            for client in unrecognized_clients
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Everhour clients with no ontology description'),
        table
    ]


def render_clients_without_account_managers():
    clients = globals.omni.clients.get_all().values()
    clients_without_account_managers = [
        c
        for c in clients
        if not c.account_manager
    ]

    if len(clients_without_account_managers) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Name'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(client.name, href=client.omni_url))
                ]
            )
            for client in clients_without_account_managers
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Clients without account managers'),
        table
    ]


def render_cases_without_sponsor():
    cases = globals.omni.cases.get_active_cases()

    cases_without_sponsor = [
        c
        for c in cases
        if not c.sponsor
    ]

    if len(cases_without_sponsor) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Title'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(case.title, href=case.omni_url))
                ]
            )
            for case in cases_without_sponsor
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Cases without sponsor'),
        table
    ]


def render_sponsors_without_crm_profile():
    sponsors = globals.omni.sponsors.get_all().values()

    sponsors_without_crm_profile = [
        sponsor
        for sponsor in sponsors
        if not sponsor.crm_id
    ]

    if len(sponsors_without_crm_profile) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Sponsor'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(sponsor.name, href=sponsor.omni_url))
                ]
            )
            for sponsor in sponsors_without_crm_profile
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Sponsors without CRM profile'),
        table
    ]


def render_sponsors_without_photo():
    sponsors = globals.omni.sponsors.get_all().values()

    sponsors_without_photo = [
        sponsor
        for sponsor in sponsors
        if sponsor.photo_url == '/assets/who_is_it.jpeg'
    ]

    if len(sponsors_without_photo) == 0:
        return []

    thead = html.Thead(
        [
            html.Th('Sponsor'),
        ]
    )

    tbody = html.Tbody(
        children=[
            html.Tr(
                [
                    html.Td(html.A(sponsor.name, href=sponsor.omni_url))
                ]
            )
            for sponsor in sponsors_without_photo
        ]
    )

    table = dbc.Table(children=[thead, tbody], bordered=True)

    return [
        title.section('Sponsors without photo'),
        table
    ]


def layout():
    return (
            render_unrecognized_workers() +
            render_cases_with_no_everhour_project() +
            render_everhour_projects_with_no_case() +
            render_unrecognized_clients() +
            render_clients_without_account_managers() +
            render_cases_without_sponsor() +
            render_sponsors_without_crm_profile() +
            render_sponsors_without_photo()
    )
