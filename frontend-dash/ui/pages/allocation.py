import dash
import dash_bootstrap_components as dbc
import pandas as pd
from dash import html, callback, Input, Output

import globals
import ui.components.allocation.allocation_by_client as abc
import ui.components.allocation.allocation_by_product_or_service as abpos
import ui.components.allocation.allocation_by_case as by_case
import ui.components.allocation.allocation_by_kind as abk
import ui.components.allocation.allocation_by_worker as abw
import ui.components.dataset_selector as selector
import ui.components.allocation.allocation_by_working_day as abwd
import ui.components.last_six_weeks_work_summary as lswws

dash.register_page(__name__, title='Omniscope')


def layout():
    return html.Div(
        [
            selector.render('overview-datasets-dropdown'),
            html.Div(id='overview-content-area'),
        ]
    )


@callback(
    Output('overview-content-area', 'children'),
    Input('overview-datasets-dropdown', 'value'),
)
def update_content_area(dataset_slug):
    print(f'Loading {dataset_slug}')
    ap = globals.datasets.get_by_slug(dataset_slug)
    data = ap.data

    data['Date'] = pd.to_datetime(data['Date'])

    return dbc.Container(
        [
            abk.render(data),
            html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
            abpos.render(data),
            html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
            abc.render(data),
            html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
            abw.render(data),
            html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
            abwd.render(data),
            lswws.render(ap, dataset_slug),
            html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
            by_case.render(ap.data)

        ], fluid=True, className="mt-4"
    )
