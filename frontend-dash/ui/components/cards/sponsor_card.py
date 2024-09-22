import dash_bootstrap_components as dbc
from dash import dcc, html
from models.domain.sponsors import Sponsor

import globals

def render(sponsor: Sponsor):
    # badges = [
    #     dbc.Badge(error, color="danger", className="me-1", style={'width': 'auto'})
    #     for error in worker.errors
    # ]

    return dbc.Col(
        dbc.Card(
            dcc.Link(
                dbc.CardBody(
                    [
                        html.Div(
                            html.Img(
                                src=str(sponsor.photo_url),
                                className="img-fluid rounded-circle mb-3",  # Bootstrap classes for image styling
                                style={
                                    'width': '150px',
                                    'height': '150px',
                                    'object-fit': 'cover'
                                }
                            ),
                            className="d-flex justify-content-center"
                        ),
                        html.H4(sponsor.name, className="card-title text-center text-light"),
                        html.P(
                            (globals.omni.clients.get_by_id(sponsor.client_id).name if sponsor.client_id else 'N/A'),
                            className="card-text text-center text-light"  # Bootstrap classes for text alignment and light color
                        ),
                        #html.Div(badges, className="badge-container")  # Ensure badges wrap correctly
                    ],
                    className="position-relative pb-4 text-light"  # Bootstrap class for padding bottom and text color
                ),
                href=sponsor.omni_url,
                className="text-decoration-none text-reset"
            ),
            className='icon-card bg-dark border-0 shadow-sm rounded card-hover',  # Bootstrap classes for card styling and custom class
            style={
                "width": "100%",
                "margin": "10px",
                "min-height": "350px"  # Ensures all cards have the same minimum height
            }
        ),
        xs=12,  # Em telas extra pequenas (<= 576px), cada item ocupa 12 colunas (largura total da linha)
        sm=6,   # Em telas pequenas (>= 576px), cada item ocupa 6 colunas (dois itens por linha)
        md=4,   # Em telas médias (>= 768px), cada item ocupa 4 colunas (três itens por linha)
        lg=3,   # Em telas grandes (>= 992px), cada item ocupa 3 colunas (quatro itens por linha)
        xl=3    # Em telas extra grandes (>= 1200px), cada item também ocupa 3 colunas (quatro itens por linha)
    )
