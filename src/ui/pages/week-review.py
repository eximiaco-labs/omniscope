import dash
import ast
from dash import html, dcc, callback, Input, Output, State
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta
import pandas as pd
from dash_bootstrap_components import Card

import globals

from models.helpers.weeks import Weeks
import models.datasets.timesheet_dataset as tsds

import ui.components.base.cards as c
import ui.components.base.title as title
import ui.components.allocation.allocation_sidebyside_table as asbst
from ui.helpers.beaulty import format_date_with_suffix

dash.register_page(__name__, path='/', redirect_from=['/week-review'], name='Omniscope')


def create_week_row(date_of_interest: datetime, kind: str) -> html.Div:
    start_of_week, end_of_week = Weeks.get_week_dates(date_of_interest)
    week = Weeks.get_week_string(date_of_interest)

    dataset = globals.datasets.timesheets.get_last_six_weeks(date_of_interest)
    df = dataset.data
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.date
    df = df[df['Kind'] == kind]

    max_value = df.groupby('Date')['TimeInHs'].sum().max() * 1.05

    dates = [
        start_of_week + timedelta(days=i)
        for i in range(7)
    ]

    cards = [
        c.create_day_card(d, date_of_interest, df, max_value)
        for d in dates
    ]

    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(card, width=True)
                    for card in cards
                ], style={'marginBottom': '10px'}
            ),
            asbst.render(tsds.get_six_weeks_allocation_analysis(df, date_of_interest))
        ]
    )


def layout():
    button_group = html.Div(
        [
            dbc.RadioItems(
                id="radios-kind",
                className="btn-group",
                inputClassName="btn-check",
                labelClassName="btn btn-outline-primary",
                labelCheckedClassName="active",
                options=[
                    {"label": "Squad", "value": 0},
                    {"label": "Consulting", "value": 1},
                    {"label": "Internal", "value": 2},
                ],
                value=1,
            ),
        ],
        className="radio-group text-center mb-3",
    )

    return html.Div(
        [
            dcc.DatePickerSingle(
                id='week-datepicker',
                display_format='MMM Do, YY',
                month_format='MMM Do, YY',
                placeholder='MMM Do, YY',
                date=datetime.today().date()
            ),
            button_group,
            dcc.Store(id='selected-date-store'),
            html.Div(id='week-content-area')
        ],
    )


@callback(
    Output('week-content-area', 'children'),
    Input('week-datepicker', 'date'),
    Input('radios-kind', 'value'),
)
def update_week_content_area(selected_date: str, radios_kind: int):
    date_of_interest = datetime.strptime(selected_date, '%Y-%m-%d')

    kind = ['Squad', 'Consulting', 'Internal']

    return html.Div(
        create_week_row(date_of_interest, kind[radios_kind])
        # [
        #     title.section('Consulting'),
        #     create_week_row(date_of_interest, 'Consulting'),
        #     title.section('Squads'),
        #     create_week_row(date_of_interest, 'Squad'),
        #     title.section('Internal'),
        #     create_week_row(date_of_interest, 'Internal'),
        # ]
    )


@callback(
    Output('week-datepicker', 'date'),
    Input({'type': 'day-card', 'index': dash.dependencies.ALL}, 'n_clicks'),
    State({'type': 'day-card', 'index': dash.dependencies.ALL}, 'id'),
    prevent_initial_call=True
)
def update_date_picker(n_clicks, ids):
    ctx = dash.callback_context
    if not ctx.triggered:
        return dash.no_update

    clicked_card = ast.literal_eval(ctx.triggered[0]['prop_id'].split('.')[0])
    clicked_date = datetime.strptime(clicked_card['index'], "%Y-%m-%d").date()

    if clicked_date:
        return clicked_date

    return dash.no_update
