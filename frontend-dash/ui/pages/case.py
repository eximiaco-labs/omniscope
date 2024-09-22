import dash
from dash import html

import globals
import ui.areas.datasets as ds_ui
import ui.components.headers.case_header as ch

dash.register_page(__name__, path_template="/cases/<slug>", title='Omniscope')


def layout(slug: str, **kwargs):
    c = globals.omni.cases.get_by_slug(slug)
    return html.Div(
        [
            ch.render(c),
            ds_ui.render(CaseTitle=c.title),
        ]
    )
