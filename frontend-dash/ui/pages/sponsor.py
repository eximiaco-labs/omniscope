import dash
from dash import html, dcc

import globals
#import ui.components.dataset_selector as selector
import ui.components.headers.sponsor_header as sh
import ui.areas.datasets as ds_ui

dash.register_page(__name__, path_template="/sponsors/<slug>", title='Omniscope')


def layout(slug: str, **kwargs):
    sponsor = globals.omni.sponsors.get_by_slug(slug)

    return html.Div(
        [
            dcc.Store('sponsor-slug-store', data=slug),
            sh.render(sponsor),
            ds_ui.render(Sponsor=sponsor.name)
        ]
    )


# @callback(
#     Output('sponsor-content-area', 'children'),
#     Input('sponsor-datasets-dropdown', 'value'),
#     [State('sponsor-slug-store', 'data')]
# )
# def update_content_area(dataset_slug: str, slug: str, **kwargs):
#     sponsor_name = globals.omni.sponsors.get_by_slug(slug).name
#
#     ap = globals.datasets.get_by_slug(dataset_slug).filter_by('Sponsor', contains=sponsor_name)
#
#     return html.Div([
#         abk.render(ap.data),
#         html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
#         abwd.render(ap.data),
#         lswws.render(ap, dataset_slug),
#         html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
#         abw.render(ap.data),
#         html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
#         by_case.render(ap.data)
#     ])