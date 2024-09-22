import dash
import dash_bootstrap_components as dbc
from dash import html

import globals
from ui.components.cards import product_or_service_card

import ui.components.base.title as title

dash.register_page(__name__, title='Omniscope')


def layout():
    items = globals.omni.products_or_services.get_all().values()

    return html.Div([
        title.page('Our Products or Services'),
        dbc.Row(
            [
                product_or_service_card.render(item)
                for item in items
            ]
        )
    ])
