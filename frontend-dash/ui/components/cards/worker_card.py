import dash_bootstrap_components as dbc
from dash import dcc, html
from models.domain.workers import Worker

def render(worker: Worker):
    badges = [
        dbc.Badge(error, color="danger", className="me-1", style={'width': 'auto'})
        for error in worker.errors
    ]

    return dbc.Col(
        dbc.Card(
            dcc.Link(
                dbc.CardBody(
                    [
                        html.Div(
                            html.Img(
                                src=str(worker.photo_url),
                                className="img-fluid rounded-circle mb-3",  # Bootstrap classes for image styling
                                style={
                                    'width': '150px',
                                    'height': '150px',
                                    'object-fit': 'cover'
                                }
                            ),
                            className="d-flex justify-content-center"
                        ),
                        html.H4(worker.name, className="card-title text-center text-light"),  # Bootstrap classes for text alignment and color
                        html.P(
                            (worker.ontology_info.position if worker.is_recognized else 'N/A'),
                            className="card-text text-center text-light"  # Bootstrap classes for text alignment and light color
                        ),
                        html.Div(badges, className="badge-container")  # Ensure badges wrap correctly
                    ],
                    className="position-relative pb-4 text-light"  # Bootstrap class for padding bottom and text color
                ),
                href=worker.omni_url,
                className="text-decoration-none text-reset"  # Bootstrap classes to reset link styles
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
