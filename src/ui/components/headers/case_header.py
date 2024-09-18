from dash import dcc, html
import dash_bootstrap_components as dbc
from typing import List

from models.domain import Case, ProductOrService, ProductsOrServicesRepository
import globals



def render(case: Case):
    if case.client_id:
        client = globals.omni.clients.get_by_id(case.client_id)
        client_name = client.name if client else "N/A"
        client_logo_url = str(client.logo_url)
        client_omni_url = str(client.omni_url)
    else:
        client_name = "N/A"
        client_logo_url = "assets/who_is_it.jpeg"
        client_omni_url = "#"

    ap = globals.datasets.timesheets.get_last_six_weeks().data
    amountOfWork = ap.loc[ap['CaseId'] == case.id, 'TimeInHs'].sum()

    badge_data = [
        (not case.has_description, "NO DESCRIPTION", "danger"),
        (case.has_description and not case.has_updated_description, "30+ DAYS OLD DESC.", "warning"),
        (amountOfWork == 0, "NO WORK", "danger")
    ]

    badges = [
        dbc.Badge(text, color=color, className="me-1", style={'width': 'auto'})
        for condition, text, color in badge_data if condition
    ]

    p_repo = globals.omni.products_or_services

    products_or_services: List[ProductOrService] = [
        p_repo.get_by_id(offer)
        for offer in case.offers_ids
    ]


    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(
                            html.Img(
                                src=client_logo_url,
                                className="img-fluid",
                                style={
                                    'max-height': '150px',
                                    'max-width': '100%',
                                    'object-fit': 'contain'
                                }
                            ),
                            className="bg-white d-flex justify-content-center align-items-center p-2 rounded",
                            style={
                                'height': '150px',
                                'width': '150px',
                                'overflow': 'hidden'
                            }
                        ),
                        width=3,
                        className="d-flex justify-content-center align-items-center"
                    ),
                    dbc.Col(
                        html.Div(
                            [
                                dcc.Link(
                                    html.H1(
                                        client_name, className="display-4 text-light mb-1",
                                        style={'text-align': 'left'}
                                    ),
                                    href=client_omni_url,
                                    className="text-decoration-none text-primary"
                                ),
                                html.P(
                                    [
                                        case.title,
                                        html.A(
                                            "[more]",
                                            href=str(case.ontology_info.link),
                                            className="ms-1 small text-info",
                                            target='_blank'
                                        ) if case.has_description else None
                                    ],
                                    className="lead text-light mb-2",
                                    style={'text-align': 'left'}
                                ),
                                html.Div(
                                    [
                                        html.A(
                                            pos.name,
                                            href=pos.omni_url,
                                            className="ms-1 small text-info",
                                        )
                                        for pos in products_or_services
                                    ],
                                    className="d-flex flex-wrap gap-1 mt-1",
                                    style={'text-align': 'left'}
                                )
                                ,
                                html.Div(
                                    badges,
                                    className="d-flex flex-wrap gap-1 mt-1",
                                    style={'text-align': 'left'}
                                ),
                            ],
                            className="d-flex flex-column justify-content-center h-100 ps-3"
                        ),
                        width=9
                    )
                ],
                className="bg-dark p-4 rounded shadow-sm mb-4"
            )
        ]
    )
