from models.domain.clients import Client
from dash import dcc, html
import dash_bootstrap_components as dbc


def render(client: Client):
    badges = []

    if client.account_manager is None:
        badges.append(
            dbc.Badge("NO ACCOUNT MANAGER", color="warning", className="me-1", style={'width': 'auto'})
        )

    if not client.is_recognized:
        badges.append(
            dbc.Badge("UNRECOGNIZED", color="danger", className="me-1", style={'width': 'auto'})
        )
    elif not client.ontology_info.has_profile:
        badges.append(
            dbc.Badge("NO PROFILE", color="danger", className="me-1", style={'width': 'auto'})
        )

    # Renderização do gerente de conta apenas se a informação estiver disponível
    account_manager_section = html.Div(
        dcc.Link(
            html.Div(
                html.Img(
                    src=str(client.account_manager.photo_url),
                    className="img-fluid rounded-circle border border-light",  # Usando classes Bootstrap
                    style={
                        'width': '40px',
                        'height': '40px',
                        'object-fit': 'cover'
                    }
                ),
                className="bg-primary rounded-circle p-1 d-flex justify-content-center align-items-center"
            ),
            href=f'/account-managers/{client.account_manager.slug}',
            className="text-decoration-none"
        ),
        className="position-absolute",
        style={
            'top': '20px',
            'right': '20px'
        }
    ) if client.account_manager else html.Div()

    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(
                            html.Img(
                                src=str(client.logo_url),
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
                                html.H1(
                                    client.name, className="display-4 text-light mb-1",
                                    style={'text-align': 'left'}
                                ),
                                html.Div(
                                    badges,
                                    className="d-flex flex-wrap gap-1 mt-2",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
                            ],
                            className="d-flex flex-column justify-content-center h-100 ps-3 position-relative"
                        ),
                        width=9
                    )
                ],
                className="bg-dark p-4 rounded shadow-sm mb-4 position-relative"
            ),
            account_manager_section
        ],
        className="position-relative"
    )
