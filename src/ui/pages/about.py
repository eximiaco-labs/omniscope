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
                                html.Div(
                                    html.I(className="fas fa-search"),
                                    style={
                                        'fontSize': '80px',
                                        'color': 'white',
                                        'backgroundColor': '#343a40',
                                        'border': '4px solid white',
                                        'borderRadius': '50%',
                                        'width': '120px',
                                        'height': '120px',
                                        'display': 'flex',
                                        'alignItems': 'center',
                                        'justifyContent': 'center',
                                        'margin': '0 auto 20px auto'
                                    }
                                ),
                                html.H1("Omniscope", className="display-1", style={'color': 'white', 'fontWeight': 'bold'}),
                                html.H2("Discover the Unknown", className="display-4", style={'color': 'lightgray'}),
                                html.P(
                                    "Welcome to Omniscope, your centralized hub for all EximiaCo applications. Stay informed and keep track of everything happening within the company at a glance.",
                                    className="lead",
                                    style={'color': 'lightgray'}
                                ),
                                dcc.Link(
                                    dbc.Button(
                                        "Explore Now",
                                        color="primary",
                                        size="lg"
                                    ),
                                    href="/",
                                    style={'marginTop': '20px'}
                                )
                            ],
                            style={
                                'textAlign': 'center',
                                'backgroundColor': '#343a40',
                                'padding': '50px',
                                'borderRadius': '10px',
                                'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)',
                                'maxWidth': '700px',
                                'margin': '20px auto'
                            }
                        ),
                        width=12
                    )
                )
            ],
            style={'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center'}
        )
    ],
    style={'margin': '0', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center'}
)