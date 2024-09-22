import dash
from dash import html, dcc
import dash_bootstrap_components as dbc

from ui.components import navbar
from ui.components import sidebar


def render():
    return html.Div(
        children=[
            dcc.Location(id='url', refresh=True),
            navbar.render(),
            sidebar.render(),

            html.Div(
                dcc.Loading(
                    dbc.Container(
                        dash.page_container,
                        className="dbc dbc-ag-grid"
                    ),
                    overlay_style={"visibility": "visible", "filter": "blur(2px)"},
                ), style={'margin-left': '3.9rem', 'margin-top': '60px'}
            )
        ],
        style={'backgroundColor': dbc.themes.BOOTSTRAP},
    )
