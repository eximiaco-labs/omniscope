import globals
import dash
from dash import html

import ui.components.lte_by as wtf

dash.register_page(__name__, title='Omniscope')


def layout(**kwargs):
    ap = (globals.datasets.timesheets.get_last_six_weeks())

    return html.Div(
        [
            wtf.render(ap, by='Worker')
        ]
    )
