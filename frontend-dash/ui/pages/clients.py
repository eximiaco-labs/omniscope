import dash
from dash import html
import dash_bootstrap_components as dbc
import ui.components.cards.client_card as cc

import globals
import ui.components.base.title as title

dash.register_page(__name__, title='Omniscope')


def layout(**kwargs):
    clients = sorted(globals.omni.clients.get_all().values(), key=lambda client: client.name)
    strategic_clients = [
        c for c in clients
        if c.is_strategic
    ]

    non_strategic_clients = [
        c for c in clients
        if not c.is_strategic
    ]

    return html.Div(
        [
            title.page('Our Clients'),
            title.section('Our Strategic Clients'),
            dbc.Row(
                [
                    cc.render(client)
                    for client in strategic_clients
                ], justify='center'
            ),
            title.section('Other Clients'),
            dbc.Row(
                [
                    cc.render(client)
                    for client in non_strategic_clients
                ], justify='center'
            ),
        ],
    )
