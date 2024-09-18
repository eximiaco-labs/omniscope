from models.domain.workers import Worker
from dash import dcc, html
import dash_bootstrap_components as dbc

def render(worker: Worker):
    kind = worker.kind.value.upper()
    badges = [
        dbc.Badge(kind, color="info", className="me-1", style={'width': 'auto'})
    ]

    badges += [
        dbc.Badge(error, color="danger", className="me-1", style={'width': 'auto'})
        for error in worker.errors
    ]

    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(
                            html.Img(
                                src=str(worker.photo_url),
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
                                    worker.name, className="display-4 text-light mb-1",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
                                html.P(
                                    [
                                        worker.ontology_info.position if worker.is_recognized else 'N/A',
                                        dcc.Link(
                                            "[more]",
                                            href=str(worker.ontology_info.link),
                                            className="ms-1 small text-info",  # Usando classes Bootstrap
                                            target="_blank"
                                        ) if worker.is_recognized and worker.ontology_info.has_profile else None
                                    ],
                                    className="lead text-light mb-2",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
                                html.Div(
                                    badges,
                                    className="d-flex flex-wrap gap-1 mt-1",  # Usando classes Bootstrap
                                    style={'text-align': 'left'}
                                ),
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
