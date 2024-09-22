from dash import callback
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output


def render(user_name: str):
    return html.Div(
        [
            html.H1("Who are you?", className="text-danger"),
            html.Hr(),
            html.P(
                children=[
                    html.Strong(user_name), " is not listed in our ontology",
                ]
            ),
            html.P(id="link-container")
        ],
        className="p-3 bg-light rounded-3",
    )


@callback(Output('link-container', 'children'),
          [Input('url', 'href')])
def render_link(href):
    if href:
        absolute_url = f"{href}/logout"
        return html.A('Logout', href=absolute_url)
    return 'URL não disponível'
