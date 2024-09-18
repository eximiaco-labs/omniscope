import dash
import dash_bootstrap_components as dbc
from dash import html, dcc, Output, Input, State, callback

import globals
import ui.components.headers.worker_header as wh
import ui.areas.datasets as ds_ui


def _create_graph_card(title, graph):
    return dbc.Card(
        [
            dbc.CardHeader(title),
            dbc.CardBody([graph])
        ], className="mb-4"
    )


dash.register_page(__name__, path_template="/consultants/<slug>", title='Omniscope')


def layout(slug: str, **kwargs):
    consultant = globals.omni.workers.get_by_slug(slug)

    result = html.Div(
        [
            wh.render(consultant),
            ds_ui.render(WorkerName=consultant.name)
        ]
    )

    return result
