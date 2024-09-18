import dash
from dash import html, dcc, Input, Output, State, callback

import globals
import ui.components.allocation.allocation_by_case as by_case
import ui.components.allocation.allocation_by_kind as abk
import ui.components.allocation.allocation_by_worker as abw
import ui.components.allocation.allocation_by_working_day as abwd
import ui.components.dataset_selector as selector
import ui.components.last_six_weeks_work_summary as lswws
from ui.components.headers import product_or_service_header as pos_header

dash.register_page(__name__, path_template="/products-or-services/<slug>", title='Omniscope')


def layout(slug: str, **kwargs):
    pos = globals.omni.products_or_services.get_by_slug(slug)

    return html.Div(
        [
            dcc.Store('pos-slug-store', data=slug),
            pos_header.render(pos),
            selector.render('pos-datasets-dropdown'),
            html.Div(id='pos-content-area'),
        ]
    )


@callback(
    Output('pos-content-area', 'children'),
    Input('pos-datasets-dropdown', 'value'),
    [State('pos-slug-store', 'data')]
)
def update_content_area(dataset_slug: str, slug: str, **kwargs):
    pos_name = globals.omni.products_or_services.get_by_slug(slug).name

    ap = globals.datasets.get_by_slug(dataset_slug).filter_by('ProductsOrServices', contains=pos_name)

    return html.Div([
        abk.render(ap.data),
        html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
        abwd.render(ap.data),
        lswws.render(ap, dataset_slug),
        html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
        abw.render(ap.data),
        html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
        by_case.render(ap.data)
    ])