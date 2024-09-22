from dash import dcc, html
import dash_bootstrap_components as dbc


def render(title: str, level: int = 2):
    if level == 2:
        h = html.H2(
            title, className="display-4 text-center",
            style={'text-align': 'center'}
        )
    elif level == 3:
        h = html.H3(
            title, className="display-5 text-center",
            style={'margin-top': "20px"}
        )
    else:
        h = html.Div()  # Em caso de nível diferente de 2 ou 3, retorna uma Div vazia

    return dbc.Row(
        dbc.Col(
            html.Div(
                h,
                style={'margin-bottom': '30px'}
            ),
            width=12
        )
    )


def page(title: str):
    return html.H1(
        title,
        className="display-4 text-center",
        style={'margin-top': '100', 'margin-bottom': '30px'}
    )


def section(title: str):
    return html.H4(
        title, className="text-center",
        style={'margin-top': '50px', 'margin-bottom': '30px'}
        )
