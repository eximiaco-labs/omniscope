from dash import html, dcc
import dash_bootstrap_components as dbc

from models.domain.clients import Client


def render(client: Client):
    body = [
        html.H5(
            client.name, className="card-title text-center text-light",
            style={"font-size": "12px", "margin-top": "5px", "margin-bottom": "5px"}
            )
    ]
    if client.id < 0:
        body.append(html.Span(client.tracker_info[0].id, className="badge text-center bg-info me-1") )

    return dbc.Col(
        dcc.Link(
            dbc.Card(
                [
                    # Container com fundo branco para a imagem
                    html.Div(
                        dbc.CardImg(
                            src=str(client.logo_url), top=True,
                            style={"max-height": "100px", "max-width": "100%", "object-fit": "contain"}
                        ),
                        className="d-flex justify-content-center align-items-center bg-white p-2 rounded",
                        # Usando classes Bootstrap
                        style={"height": "100px", "overflow": "hidden"}
                    ),
                    dbc.CardBody(
                        body
                    ),
                ],
                className="bg-dark border-0 shadow-sm rounded card-hover",  # Usando classes Bootstrap
                style={"width": "100%", "margin": "10px", "cursor": "pointer", "transition": "transform 0.3s"}
            ),
            href=client.omni_url,
            className="text-decoration-none"
        ),
        xs=6, sm=6, md=4, lg=3, xl=2
    )
