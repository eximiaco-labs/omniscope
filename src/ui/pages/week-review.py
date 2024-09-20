import ast
from datetime import datetime

import dash
import dash_bootstrap_components as dbc
import pandas as pd
from dash import html, dcc, callback, Input, Output, State

import globals
import models.datasets.timesheet_dataset as tsds
import ui.components.allocation.allocation_sidebyside_table as asbst
import ui.components.base.cards as c
import ui.components.date_picker_calendar as dpc
import ui.components.dataset_selector as selector

dash.register_page(__name__, path='/', redirect_from=['/week-review'], name='Omniscope')


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
        className="radio-group text-center",
    )

    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                       dpc.render(datetime.today()), width="auto"
                    ),

                    # dbc.Col(
                    #     dcc.DatePickerSingle(
                    #         id='week-datepicker',
                    #         display_format='MMM Do, YY',
                    #         month_format='MMM Do, YY',
                    #         placeholder='MMM Do, YY',
                    #         date=datetime.today().date(),
                    #     ),
                    #     width="auto"  # Deixa a coluna com tamanho ajustado ao conteúdo
                    # ),
                    dbc.Col([
                            selector.render('week-review', default_option='timesheet-previous-week', label='Dataset'),
                            button_group,
                        ],
                         # Mantém o botão ajustado ao seu tamanho
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
    Output({'type': 'dataset-dropdown', 'id': 'week-review'}, 'value'),
    Input('radios-kind', 'value'),
    Input('selected-date-store', 'data'),
)
def update_week_content_area(radios_kind: int, selected_date: str):
    date_of_interest = datetime.strptime(selected_date, '%Y-%m-%d')

    kind = ['Squad', 'Consulting', 'Internal']

    dataset = globals.datasets.timesheets.get_last_six_weeks(date_of_interest)
    df = dataset.data
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.date
    df = df[df['Kind'] == kind[radios_kind]]

    dataset = f'timesheet-last-six-weeks-{selected_date}'

    return html.Div(
        [
            c.create_week_row(date_of_interest, kind[radios_kind]),
            dbc.Row(
                [
                    dbc.Col(c.create_month_card(date_of_interest, kind=kind[radios_kind]), width=3),
                    dbc.Col(c.create_week_card(date_of_interest, kind=kind[radios_kind]), width=3),
                    dbc.Col(c.create_lte_card(date_of_interest, kind=kind[radios_kind]), width=6),
                ], class_name='mb-3'
            ),
            asbst.render(tsds.get_six_weeks_allocation_analysis(df, date_of_interest))
        ]
    ), dataset


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
