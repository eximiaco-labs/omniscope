import dash
from dash import html

import globals
import ui.components.headers.worker_header as wh

import ui.areas.datasets as ds_ui

dash.register_page(__name__, path_template="/account-managers/<slug>", title='Omniscope')


def layout(slug: str):
    am = globals.omni.workers.get_by_slug(slug)

    result = html.Div(
        [
            # dcc.Store('am-slug-store', data=slug),
            wh.render(am),
            ds_ui.render(AccountManagerName=am.name)
        ]
    )

    return result

