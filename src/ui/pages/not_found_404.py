import dash
from dash import html, dcc
import dash_bootstrap_components as dbc

dash.register_page(__name__, title='Omniscope')

layout = html.Div(
    [
        dbc.Container(
            [
                dbc.Row(
                    dbc.Col(
                        html.Div(
                            [
                                html.H1("404", className="display-1", style={'color': 'white'}),
                                html.H2("Oops! You seem lost.", className="display-4", style={'color': 'lightgray'}),
                                html.P(
                                    "The page you're looking for doesn't exist. How about we start over?",
                                    className="lead",
                                    style={'color': 'lightgray'}
                                ),
                                dcc.Link(
                                    dbc.Button("Take me home", color="primary", size="lg"),
                                    href="/",
                                    style={'margin-top': '20px'}
                                )
                            ],
                            style={
                                'text-align': 'center',
                                'background-color': '#343a40',
                                'padding': '50px',
                                'border-radius': '10px',
                                'box-shadow': '0 4px 8px 0 rgba(0,0,0,0.2)'
                            }
                        ),
                        width=12
                    )
                )
            ],
            style={'display': 'flex', 'justify-content': 'center', 'align-items': 'center',}
        )
    ],
    style={'margin': '0', 'display': 'flex', 'justify-content': 'center', 'align-items': 'center'}
)