from dash import dcc
import dash_bootstrap_components as dbc

from models.domain import ProductOrService


def render(ps: ProductOrService):
    return dbc.Col(
        dcc.Link(
            dbc.Card(
                [
                    dbc.CardImg(src=ps.cover_image_url, style={'width': 'auto'}, top=True),
                    dbc.CardBody(
                        [
                            dcc.Markdown(ps.name, dangerously_allow_html=True,
                                         className="card-text text-light text-center text-decoration-none")
                        ]
                    )
                ],
                style={'margin': '10px'},
                className='icon-card bg-dark border-0 shadow-sm rounded card-hover',
            ),
            href=ps.omni_url,
            className='text-decoration-none'
        ),

        xs=12, sm=6, md=4, lg=3, xl=3
    )
