from dash import html, dcc
import dash_bootstrap_components as dbc

from models.domain.cases import Case
from datetime import datetime
import globals
import pytz


def render(case: Case):
    client_name = case.find_client_name(globals.omni.clients)

    badges = [
        dbc.Badge(error, color="danger", className="me-1", style={'width': 'auto'})
        for error in case.errors
    ]

    ap = globals.datasets.timesheets.get_last_six_weeks().data
    amountOfWork = ap.loc[ap['CaseId'] == case.id, 'TimeInHs'].sum()
    if amountOfWork == 0:
        badges.append(dbc.Badge('NO WORK', color="danger", className="me-1", style={'width': 'auto'}))

    kind = []
    if any(ti for ti in case.tracker_info if ti.is_squad):
        kind.append(html.H6(dbc.Badge('SQUAD', color="info")))

    if any(ti for ti in case.tracker_info if not (ti.is_squad or ti.is_eximiaco)):
        kind.append(html.H6(dbc.Badge('CONSULTING', color="success")))

    everhour_project_id = ''
    if not case.has_description:
        everhour_project_id = case.everhour_projects_ids[0] if case.everhour_projects_ids else ''

    brasilia = pytz.timezone('America/Sao_Paulo')
    last_update = (case.ontology_info.last_update_gmt.astimezone(brasilia).strftime("%d-%m-%Y - %H:%M")
                   if case.ontology_info and case.ontology_info.last_update_gmt else "Unknown")

    status = case.status if case.status else None

    status_color = {
        "Critical": "danger",
        "Requires attention": "warning",
        "All right": "success"
    }.get(status, "secondary")

    if status:
        badges.append(dbc.Badge(status.upper(), color=status_color, className="me-1", style={'width': 'auto'}))
        if (datetime.now() - case.last_updated).days > 21:
            badges.append(dbc.Badge('OUTDATED', color="danger", className="me-1", style={'width': 'auto'}))
    elif case.has_description:
        badges.append(dbc.Badge('NO UPDATES', color="danger", className="me-1", style={'width': 'auto'}))

    header_color = "#220000" if status == "Critical" else "#554400" if status == "Requires attention" else "primary"
    body_color = "#552222" if status == "Critical" else "#555522" if status == "Requires attention" else None

    card_header_style = {"background-color": header_color} if status else {}
    card_body_style = {"background-color": body_color, 'padding': '20px'} if status else {'padding': '20px'}

    children = [
        dbc.CardHeader(children=[
                html.H5(client_name, className="text-center"),
                html.P(case.sponsor, className="text-center"),
            ],
            style=card_header_style
        ),
        dbc.CardBody(
            [
                html.Div(
                    [
                        html.Div(kind, className="text-center"),
                        html.H6(
                            dcc.Markdown(case.title, dangerously_allow_html=True), className="text-center"
                        ),
                    ],
                    className="mb-3"
                ),
                html.Div(
                    html.Span(f"{amountOfWork:.1f} hs", className="badge"),
                    className="text-center mb-3"
                ),
                html.Div(
                    html.Span(everhour_project_id, className="badge bg-info me-1"),
                    className="text-center mb-3"
                ),
                # html.P(
                #     f'Last modified: {last_update}',
                #     className="text-center text-muted",
                #     style={'fontSize': '12px'}
                # ),
            ],
            className="position-relative flex-grow-1",
            style=card_body_style
        )
    ]

    # Adiciona o CardFooter se houver badges
    if badges:
        footer_style = {"background-color": header_color} if status else {}
        children.append(
            dbc.CardFooter(
                html.Div(
                    badges,
                    className="d-flex flex-wrap gap-1"
                ),
                style=footer_style
            )
        )

    return dbc.Col(
        dcc.Link(
            dbc.Card(
                children,
                className='icon-card',
                style={
                    "width": "100%",
                    "margin": "10px",
                    "border": "none",
                    "border-radius": "10px",
                    "overflow": "hidden",
                    "position": "relative",
                    "min-height": "350px",
                    "display": "flex",
                    "flex-direction": "column",
                    "justify-content": "space-between"
                },
            ),
            href=case.omni_url, target='_blank',
            className="text-decoration-none"
        ),
        xs=12,
        sm=12,
        md=6,
        lg=4,
        xl=3
    )