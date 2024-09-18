from models.domain.sponsors import Sponsor

from dash import dcc, html
import dash_bootstrap_components as dbc

import globals


def render(sponsor: Sponsor):
    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(
                            html.Img(
                                src=str(sponsor.photo_url),
                                className="img-fluid rounded-circle mb-3",  # Usando classes Bootstrap
                                style={
                                    'width': '150px',
                                    'height': '150px',
                                    'object-fit': 'cover'
                                }
                            ),
                            className="d-flex justify-content-center"
                        ),
                        width=3
                    ),
                    dbc.Col(
                        html.Div(
                            [
                                html.H1(
                                    sponsor.name, className="display-4 text-light mb-1",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
                                html.P(
                                    [
                                        (globals.omni.clients.get_by_id(
                                            sponsor.client_id
                                            ).name if sponsor.client_id else 'N/A'),
                                        dcc.Link(
                                            "[more]",
                                            href=str(sponsor.linkedin_url),
                                            className="ms-1 small text-info",  # Usando classes Bootstrap
                                            target="_blank"
                                        ) if sponsor.linkedin_url else None
                                    ],
                                    className="lead text-light mb-2",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
                                # html.Div(
                                #     badges,
                                #     className="d-flex flex-wrap gap-1 mt-1",  # Usando classes Bootstrap
                                #     style={'text-align': 'left'}
                                # ),
                            ],
                            className="d-flex flex-column justify-content-center h-100 ps-3"  # Usando classes Bootstrap
                        ),
                        width=9
                    )
                ],
                className="bg-dark p-4 rounded shadow-sm mb-4"  # Usando classes Bootstrap
            )
        ]
    )
