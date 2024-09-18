import dash
from dash import html

import globals
import ui.components.headers.client_header as ch
import ui.areas.datasets as ds_ui

dash.register_page(__name__, path_template="/clients/<slug>", title='Omniscope')


def layout(slug: str):
    client = globals.omni.clients.get_by_slug(slug)

    return html.Div(
        [
            ch.render(client),
            ds_ui.render(ClientName=client.name)
        ]
    )

