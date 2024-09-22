from models.domain import ProductOrService
from dash import dcc, html
import dash_bootstrap_components as dbc


def render(pos: ProductOrService):
    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(
                            html.Img(
                                src=str(pos.cover_image_url),
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
                                    pos.name, className="display-4 text-light mb-1",
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
        ],
        className="position-relative"
    )
