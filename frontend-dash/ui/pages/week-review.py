import ast
from datetime import datetime

import dash
import dash_bootstrap_components as dbc
import pandas as pd
from dash import html, callback, Input, Output, State

import globals
import models.datasets.timesheet_dataset as tsds
import ui.components.allocation.allocation_sidebyside_table as asbst
import ui.components.base.cards as c
import ui.components.date_picker_calendar as dpc
import ui.components.dataset_selector as selector

dash.register_page(__name__, path='/', redirect_from=['/week-review'], name='Omniscope')


def layout():
    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        dpc.render(datetime.today()), width="auto"
                    ),
                    dbc.Col(
                        [
                            selector.render(
                                'week-review',
                                # default_option='timesheet-previous-week',
                                label='Dataset',
                                show_dropdown=False,
                            ),
                        ],
                    ),
                ],
                align="center",
                justify="center",
                className='mb-3'
            ),
            html.Div(id='week-content-area')
        ],
    )


@callback(
    Output('week-content-area', 'children'),
    Input({'type': 'dataset-selector-store', 'id': 'week-review'}, 'value')
)
def update_week_content_area(params):
    ds = globals
    df = ds.data
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.date

    dataset_slug = params['dataset_slug']

    parts = dataset_slug.split('-')

    year = parts[-3]
    month = parts[-2]
    day = parts[-1]

    date_of_interest = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")

    return html.Div(
        [
            c.create_week_row(date_of_interest, dataset=ds),
            dbc.Row([
                dbc.Col(c.create_month_card(date_of_interest, params=params), width=3),
                dbc.Col(c.create_week_card(date_of_interest, dataset=ds), width=3),
                dbc.Col(c.create_lte_card(date_of_interest, dataset=ds), width=6),
            ], class_name='mb-3'),
            dbc.Row(
                asbst.render(tsds.get_six_weeks_allocation_analysis(df, date_of_interest)),
                class_name='mb-3'
            ),
            dbc.Row(
                asbst.render(tsds.get_six_weeks_allocation_analysis(df, date_of_interest, 'ClientName')),
                class_name='mb-3'
            ),
        ]
    )


@callback(
    Output({'type': 'dataset-dropdown', 'id': 'week-review'}, 'value'),
    Input('selected-date-store', 'data')
)
def update_selector(selected_date: str):
    return f'timesheet-last-six-weeks-{selected_date}'


@callback(
    Output('selected-date-store', 'data', allow_duplicate=True),
    Input({'type': 'day-card', 'index': dash.dependencies.ALL}, 'n_clicks'),
    State({'type': 'day-card', 'index': dash.dependencies.ALL}, 'id'),
    prevent_initial_call=True,
)
def update_date_picker(n_clicks, ids):
    if all(click is None for click in n_clicks):
        return dash.no_update

    ctx = dash.callback_context
    if not ctx.triggered:
        return dash.no_update

    clicked_card = ast.literal_eval(ctx.triggered[0]['prop_id'].split('.')[0])
    clicked_date = datetime.strptime(clicked_card['index'], "%Y-%m-%d").date()

    if clicked_date:
        return clicked_date

    return dash.no_update
