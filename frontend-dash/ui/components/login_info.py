import dash_bootstrap_components as dbc
from datetime import datetime
from dash import html, dcc, callback, Input, Output
from flask import session
import globals
import humanize


def render():
    # user_name = session["user"]["email"]
    # worker = globals.omni.workers.get_by_name(user_name)
    #
    # if worker is None:
    #     return html.Pre(str(session))

    return dbc.Row(
        dbc.DropdownMenu(
            right=True,
            label=greeting(),
            color="secondary",
            menu_variant='dark',
            id="menu-items",
        ),
        className="g-0 ms-auto flex-nowrap mt-3 mt-md-0",
        align="center",
    )


def greeting():
    full_name = session["user"]["email"]
    name_parts = full_name.split()
    first_name = name_parts[0] if name_parts else 'Guest'
    return f'Hi, {first_name}!'


@callback(
    Output('time-difference', 'children'),
    [Input('interval-component', 'n_intervals')]
)
def update_time_difference(n):
    now = datetime.now()
    time_difference = now - globals.last_update_time
    friendly_time_difference = humanize.naturaltime(time_difference)
    return f"LAST UPDATE: {friendly_time_difference}"


@callback(Output('menu-items', 'children'),
          [Input('url', 'href')])
def render_link(href):
    if href:
        absolute_url = f"{href}oidc/logout"
        # user_name = session["user"]["email"]
        # worker = globals.omni.workers.get_by_name(user_name)

        return [dbc.DropdownMenuItem(
            dbc.Row(
                [
                    dbc.Col(
                        html.Div(id='time-difference'),
                        width="auto",
                        className="text-uppercase fw-bold",
                        style={'font-size': '60%', 'margin-right': '5px'}
                    ),
                    dcc.Interval(
                        id='interval-component',
                        interval=10 * 1000,
                        n_intervals=0
                    ),
                ],
                className="g-0 ms-auto flex-nowrap mt-3 mt-md-0",
                align="center",
            ), disabled=True,
        ),
            dbc.DropdownMenuItem(divider=True, className="bg-dark"),
            # dbc.DropdownMenuItem("My Page", href=str(worker.omni_url)),
            dbc.DropdownMenuItem("Logout", href=absolute_url),
            dbc.DropdownMenuItem("Update Now!", href='/hit-refresh', target="_blank")
        ]

    return "URL nao disponível"
