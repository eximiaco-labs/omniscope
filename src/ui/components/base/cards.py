from dash import html, dcc
import numbers
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
from dash_bootstrap_components import Card

from models.helpers.weeks import Weeks
import models.datasets.timesheet_dataset as tsds
from ui.helpers.beaulty import format_date_with_suffix
import ui.components.base.colors as colors
import ui.helpers.beaulty as beauty

import plotly.graph_objects as go
import globals


def create_kpi_card(title, value, width=3, color='secondary', bottom=None, method=None):
    title_class = "text-center mb-2 text-white"

    method = method or (html.H1 if width >= 3 else html.H3)
    return dbc.Col(
        dbc.Card(
            dbc.CardBody(
                [
                    html.P(title, className=title_class),
                    method(value, className="card-text text-center")
                ] +
                ([
                     html.P(bottom, className="card-text text-center " + ("text-white" if color != 'secondary' else ""))
                 ] if bottom else []),
            ),
            color=color,
            outline=True,
            className="h-100 shadow-sm"
        ),
        width=width
    )


def create_graph_card(title, graph):
    return dbc.Card(
        [
            dbc.CardHeader(title),
            dbc.CardBody([graph])
        ], className="mb-4"
    )


def create_card(title, body):
    return dbc.Card(
        [
            dbc.CardHeader(title),
            dbc.CardBody([body])
        ], className="mb-4"
    )


def get_status_indicator(value):
    if value > 0:
        return html.Span("▲", style={"color": "green"})
    elif value < 0:
        return html.Span("▼", style={"color": "red"})
    else:
        return html.Span("=", style={"color": "gray"})


def bottom(a, b):
    if not (isinstance(a, numbers.Number) and isinstance(b, numbers.Number)) or a == 0:
        return html.Div([])

    perc = ((b - a) / b if b > a else (a - b) / a) * 100
    r_bottom = html.Div([get_status_indicator(b - a), html.Span(f' {perc:.1f}%')])
    return r_bottom


def create_day_card(date: datetime, date_of_interest: datetime, dataset: pd.DataFrame, max_value=None,
                    in_a_row: bool = True) -> Card:
    day_of_week = date.strftime('%A')
    is_the_day = date.date() == date_of_interest.date()
    is_future = date.date() > date_of_interest.date()

    text_color = "#333333" if is_future else ("white" if is_the_day else "lightgray")
    opacity = "opacity-75" if is_future else ""
    worst_color = 'Red' if not is_future else '#333333'
    avg_color = 'White' if not is_future else '#333333'
    best_color = 'Green' if not is_future else '#333333'

    s = tsds.TimesheetDateAnalysis(dataset, date, number_of_weeks=6)

    figure = create_day_card_figure(s, max_value)
    if is_future:
        disable_day_card_figure(figure)

    if in_a_row:
        header = [
            html.P(day_of_week, style={'color': text_color}, className=f"fw-bold mb-1"),
            html.Small(format_date_with_suffix(date), style={'color': text_color}, className=f"fw-bold")
        ]
    else:
        header = [
            html.P(day_of_week, className=f"fw-bold mb-1"),
            html.Small(format_date_with_suffix(date), className=f"fw-bold")
        ]

    header = dbc.CardHeader(
        header,
        className="bg-light text-center p-2"
    )

    body = dbc.CardBody(
        [
            dcc.Graph(figure=figure, config={'displayModeBar': False, 'staticPlot': True}),
        ], style={'padding': '0px', 'margin': '0px'},
    )

    footer = dbc.CardFooter(
        dbc.Row(
            [
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                format_date_with_suffix(s.worst_day), className="text-start",
                                style={'color': worst_color, 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{s.worst_day_hours:.1f}', className="text-start",
                                style={'color': worst_color}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-start"
                ),
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                f'{s.average_hours:.1f}', style={'color': avg_color},
                                className="text-center"
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-center"
                ),
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                format_date_with_suffix(s.best_day), className="text-end",
                                style={'color': best_color, 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{s.best_day_hours:.1f}', className="text-end", style={'color': best_color}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-end"
                ),
            ],
            className="gx-2"
        ),
        className="bg-light text-center p-2"
    )

    children = [header, body, footer]

    if in_a_row:
        children = html.A(
            children=children,
            href="#",
            id={'type': 'day-card', 'index': date.strftime('%Y-%m-%d')},
            className="text-decoration-none"
        )

    return dbc.Card(
        children,
        className=f'h-100 shadow-sm {opacity}' + 'cursor-pointer' if in_a_row else '',
    )


def create_day_card_figure(s, max_value: None):
    fig = go.Figure()

    columns = ['Squad', 'Consulting', 'Internal']

    for kind in columns:
        if kind in s.daily_summary:
            fig.add_trace(
                go.Bar(
                    x=s.daily_summary.index,
                    y=s.daily_summary[kind],
                    name=kind,
                    opacity=0.2,
                    marker_color=colors.KIND_COLORS[kind]
                )
            )

    fig.add_shape(
        type="line",
        x0=0,
        x1=1,
        y0=s.average_hours,
        y1=s.average_hours,
        xref='paper',
        yref='y',
        opacity=0.2,
        line=dict(
            color="white",
            width=1,
            dash="dot",
        )
    )

    fig.add_trace(
        go.Indicator(
            value=s.total_hours,
            delta={
                'reference': s.average_hours,
                'relative': True,
                'valueformat': ".1%"
            },
            domain={'x': [0.25, 0.75], 'y': [0, 1]},
            mode="number+delta",
            title={'text': None},
            name='Total Hours Indicator'
        )
    )

    dark_background_color = '#2c2f33'
    dark_text_color = '#ffffff'

    fig.update_layout(
        barmode='stack',

        paper_bgcolor=dark_background_color,
        plot_bgcolor=dark_background_color,
        font={
            'color': dark_text_color,
            'family': 'Arial'
        },
        margin=dict(l=0, r=0, t=0, b=0),

        xaxis=dict(
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            title=None
        ),

        yaxis=dict(
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            title=None,
            range=[0, max_value] if max_value is not None else None
        ),
        height=100,
        showlegend=False,
    )

    return fig


def disable_day_card_figure(figure):
    figure.update_traces(
        opacity=0.05,
        selector=dict(type='bar')
    )
    figure.update_traces(
        selector=dict(type='indicator'),
        number={'font': {'color': '#666666'}},
        delta={
            'increasing': {'color': '#003300'},
            'decreasing': {'color': '#330000'}
        },
    )
    figure.update_shapes(dict(opacity=0.05))


def create_week_row(date_of_interest: datetime, dataset=None, kind: str = None, worker_name: str = None) -> html.Div:
    start_of_week, end_of_week = Weeks.get_week_dates(date_of_interest)
    week = Weeks.get_week_string(date_of_interest)

    if not dataset:
        dataset = globals.datasets.timesheets.get_last_six_weeks(date_of_interest)

    if worker_name:
        dataset = dataset.filter_by('WorkerName', worker_name)

    df = dataset.data
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.date

    if kind:
        df = df[df['Kind'] == kind]

    max_value = df.groupby('Date')['TimeInHs'].sum().max() * 1.05

    dates = [
        start_of_week + timedelta(days=i)
        for i in range(7)
    ]

    cards = [
        create_day_card(d, date_of_interest, df, max_value)
        for d in dates
    ]

    return dbc.Row(
        [
            dbc.Col(card, width=True)
            for card in cards
        ], class_name='mb-3'
    )


def create_month_card(d: datetime, params=None, worker=None, kind: str = None) -> html.Div:
    if params:
        p = params.copy()
        p['dataset_slug'] = f'timesheet-month-{d.year}-{d.month}'
        timesheet_this_month = globals.datasets.get_by_params(p)
    else:
        timesheet_this_month = (
            globals.datasets.get_by_slug('timesheet-this-month')
        )

    if params:
        p = params.copy()
        month = d.month
        year = d.year

        month = month - 1
        if month == 0:
            month = 12
            year = year - 1
        p['dataset_slug'] = f'timesheet-month-{year}-{month}'
        timesheet_previous_month = globals.datasets.get_by_params(p)
    else:
        timesheet_previous_month = (
            globals.datasets.get_by_slug('timesheet-previous-month')
        )

    if worker:
        timesheet_this_month = timesheet_this_month.filter_by('WorkerName', worker.name)
        timesheet_previous_month = timesheet_previous_month.filter_by('WorkerName', worker.name)

    if kind:
        timesheet_this_month = timesheet_this_month.filter_by('Kind', kind)
        timesheet_previous_month = timesheet_previous_month.filter_by('Kind', kind)

    # Access data once
    this_month = timesheet_this_month.data
    previous_month = timesheet_previous_month.data

    # Group and compute the necessary aggregates
    limit = d - relativedelta(months=1)
    limit = datetime(limit.year, limit.month, limit.day, 23, 59, 59, 9999)

    hours_this_month = this_month['TimeInHs'].sum()
    hours_previous_month = previous_month['TimeInHs'].sum()
    hours_until_this_date = previous_month[previous_month['Date'] <= limit.date()]['TimeInHs'].sum()

    # Determine maximum for the gauge
    max_value = max(hours_this_month, hours_previous_month, hours_until_this_date) * 1.1

    # Build the gauge indicator
    fig = go.Figure(
        go.Indicator(
            value=hours_this_month,
            mode="gauge+number+delta",
            delta={'reference': hours_previous_month},
            gauge={
                'axis': {'range': [None, max_value]},
                'steps': [
                    {'range': [0, hours_until_this_date], 'color': 'red'},
                    {'range': [hours_until_this_date, hours_previous_month], 'color': 'lightyellow'}
                ]
            }
        )
    )

    # Set dark theme
    dark_background_color = '#2c2f33'
    dark_text_color = '#ffffff'
    fig.update_layout(
        paper_bgcolor=dark_background_color,
        plot_bgcolor=dark_background_color,
        font={
            'color': dark_text_color,
            'family': 'Arial'
        },
        height=150,
        margin=dict(l=20, r=20, t=20, b=20),
    )

    footer = dbc.CardFooter(
        dbc.Row(
            [
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                f'On {beauty.format_date_with_suffix(limit)}', className="text-start",
                                style={'color': 'red', 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{hours_until_this_date:.1f}', className="text-start",
                                style={'color': 'red'}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-start"
                ),
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                f'{limit.strftime("%b")} total', className="text-end",
                                style={'color': 'lightyellow', 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{hours_previous_month:.1f}', className="text-end", style={'color': 'lightyellow'}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-end"
                ),
            ],
            className="gx-2"
        ),
        className="bg-light text-center p-2"
    )

    # Create and return the card
    return dbc.Card(
        [
            dbc.CardHeader(
                [
                    html.P('Month Summary', className="fw-bold mb-1"),
                    html.Small('Working time', className="fw-bold"),
                ], className="bg-light text-center p-2"
            ),
            dbc.CardBody(
                [
                    dcc.Graph(figure=fig, config={'displayModeBar': False}),
                ], style={'padding': '0px', 'margin': '0px'},
            ),
            footer
        ], className=f'h-100 shadow-sm'
    )


def create_week_card(d: datetime, dataset=None, worker=None, kind=None):
    if dataset:
        timesheet = dataset
    else:
        dataset=globals.datasets.timesheets.get_last_six_weeks()

    if worker:
        timesheet = timesheet.filter_by('WorkerName', worker.name)

    if kind:
        timesheet = timesheet.filter_by('Kind', kind)

    week = Weeks.get_week_string(d)
    week_day = (d.weekday() + 1) % 7

    # Filter timesheets
    week_timesheet = timesheet.filter_by('Week', equals_to=week)
    previous_weeks_timesheet = timesheet.filter_by('Week', not_equals_to=week)

    # Access data once
    week_timesheet_data = week_timesheet.data
    previous_weeks_data = previous_weeks_timesheet.data

    # Group and compute the necessary aggregates
    grouped_timesheet = previous_weeks_data.groupby('Week')['TimeInHs'].sum().reset_index()
    previous_weeks_mean = grouped_timesheet['TimeInHs'].mean()

    # Filter up to the current weekday and compute mean
    filtered_df = previous_weeks_data[previous_weeks_data['NDayOfWeek'] <= week_day]
    previous_weeks_to_date_mean = filtered_df.groupby('Week')['TimeInHs'].sum().mean()

    # Compute the current week's sum
    week_timesheet_sum = week_timesheet_data["TimeInHs"].sum()

    # Determine maximum for the gauge
    max_value = max(week_timesheet_sum, previous_weeks_to_date_mean, previous_weeks_mean) * 1.1

    # Build the gauge indicator
    fig = go.Figure(
        go.Indicator(
            value=week_timesheet_sum,
            mode="gauge+number+delta",
            delta={'reference': previous_weeks_mean},
            gauge={
                'axis': {'range': [None, max_value]},
                'steps': [
                    {'range': [0, previous_weeks_to_date_mean], 'color': 'red'},
                    {'range': [previous_weeks_to_date_mean, previous_weeks_mean], 'color': 'lightyellow'}
                ]
            }
        )
    )

    # Set dark theme
    dark_background_color = '#2c2f33'
    dark_text_color = '#ffffff'
    fig.update_layout(
        paper_bgcolor=dark_background_color,
        plot_bgcolor=dark_background_color,
        font={
            'color': dark_text_color,
            'family': 'Arial'
        },
        height=150,
        margin=dict(l=20, r=20, t=20, b=20),
    )

    footer = dbc.CardFooter(
        dbc.Row(
            [
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                'Avg. to date', className="text-start",
                                style={'color': 'red', 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{previous_weeks_to_date_mean:.1f}', className="text-start",
                                style={'color': 'red'}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-start"
                ),
                dbc.Col(
                    dbc.Row(
                        [
                            html.Small(
                                'Avg. total', className="text-end",
                                style={'color': 'lightyellow', 'font-size': '0.6rem'}
                            ),
                            html.Small(
                                f'{previous_weeks_mean:.1f}', className="text-end", style={'color': 'lightyellow'}
                            ),
                        ],
                        className="flex-column"
                    ),
                    className="text-end"
                ),
            ],
            className="gx-2"
        ),
        className="bg-light text-center p-2"
    )

    # Create and return the card
    return dbc.Card(
        [
            dbc.CardHeader(
                [
                    html.P('Week Summary', className="fw-bold mb-1"),
                    html.Small('Working time', className="fw-bold"),
                ], className="bg-light text-center p-2"
            ),
            dbc.CardBody(
                [
                    dcc.Graph(figure=fig, config={'displayModeBar': False}),
                ], style={'padding': '0px', 'margin': '0px'},
            ),
            footer
        ], className=f'h-100 shadow-sm'
    )


def create_lte_card(d: datetime, dataset=None, worker=None, kind=None):
    if dataset:
        timesheet = dataset
    else:
        timesheet = globals.datasets.timesheets.get_last_six_weeks(d)

    if worker:
        timesheet = timesheet.filter_by('WorkerName', worker.name)

    if kind:
        timesheet = timesheet.filter_by('Kind', kind)

    summary = tsds.TimelinessSummary(timesheet.data)

    # Defining icon tooltips with color matching
    early_tooltip = f"Early: {summary.early_rows} entries, {summary.early_time_in_hours:.1f} hours"
    ok_tooltip = f"OK: {summary.ok_rows} entries, {summary.ok_time_in_hours:.1f} hours"
    acceptable_tooltip = f"Acceptable: {summary.acceptable_rows} entries, {summary.acceptable_time_in_hours:.1f} hours"
    late_tooltip = f"Late: {summary.late_rows} entries, {summary.late_time_in_hours:.1f} hours"

    # Adaptive narrative summary insight
    max_category = max(
        (summary.early_percentage, 'early'),
        (summary.ok_percentage, 'ok'),
        (summary.acceptable_percentage, 'acceptable'),
        (summary.late_percentage, 'late'),
    )

    if max_category[1] == 'early':
        summary_insight = f"Most records are categorized as 'Early', covering {summary.early_percentage:.1f}% of the total time."
    elif max_category[1] == 'ok':
        summary_insight = f"Most records are in the 'OK' category, accounting for {summary.ok_percentage:.1f}% of the total time."
    elif max_category[1] == 'acceptable':
        summary_insight = f"A significant number of records are 'Acceptable', making up {summary.acceptable_percentage:.1f}% of the total time."
    else:
        summary_insight = f"There is a notable amount of 'Late' entries, representing {summary.late_percentage:.1f}% of the total time."

    return dbc.Card(
        [
            dbc.CardHeader(
                [
                    html.P('Timeliness Summary', className="fw-bold mb-1"),
                    html.Small('Last four weeks', className="fw-bold"),
                ], className="bg-light text-center p-2"
            ),
            dbc.CardBody(
                [
                    # Progress Bar
                    dbc.Progress(
                        children=[
                            dbc.Progress(
                                value=summary.early_percentage, color="orange", bar=True,
                                label=f'{summary.early_percentage:.1f}%', id="early-tooltip",
                                style={'fontSize': '0.75em'}
                            ),
                            dbc.Progress(
                                value=summary.ok_percentage, color="green", bar=True,
                                label=f'{summary.ok_percentage:.1f}%', id="ok-tooltip",
                                style={'fontSize': '0.75em'}
                            ),
                            dbc.Progress(
                                value=summary.acceptable_percentage, color="warning", bar=True,
                                label=f'{summary.acceptable_percentage:.1f}%', id="acceptable-tooltip",
                                style={'fontSize': '0.75em'}
                            ),
                            dbc.Progress(
                                value=summary.late_percentage, color="danger", bar=True,
                                label=f'{summary.late_percentage:.1f}%', id="late-tooltip",
                                style={'fontSize': '0.75em'}
                            ),
                        ],
                        style={'height': '30px'}  # Reduced top margin
                    ),

                    # Tooltips with custom styles
                    dbc.Tooltip(
                        early_tooltip, target="early-tooltip", placement="bottom", style={'backgroundColor': 'orange'}
                        ),
                    dbc.Tooltip(
                        ok_tooltip, target="ok-tooltip", placement="bottom", style={'backgroundColor': 'green'}
                        ),
                    dbc.Tooltip(
                        acceptable_tooltip, target="acceptable-tooltip", placement="bottom",
                        style={'backgroundColor': 'gold'}
                        ),
                    dbc.Tooltip(
                        late_tooltip, target="late-tooltip", placement="bottom", style={'backgroundColor': 'red'}
                        ),

                    # Descriptive Summary Section (Grid 2x2) with matching colors
                    html.Div(
                        [
                            html.Div(
                                [
                                    html.I(className="bi bi-alarm-fill me-2", style={'color': 'orange'}),
                                    # Icon for Early
                                    html.Span(
                                        f"Early: {summary.early_rows} entries, {summary.early_time_in_hours:.1f} hours",
                                        style={'color': 'orange'}
                                        ),
                                ], className="d-flex align-items-center mb-2"
                            ),
                            html.Div(
                                [
                                    html.I(className="bi bi-check-circle-fill me-2", style={'color': 'green'}),
                                    # Icon for OK
                                    html.Span(
                                        f"OK: {summary.ok_rows} entries, {summary.ok_time_in_hours:.1f} hours",
                                        style={'color': 'green'}
                                        ),
                                ], className="d-flex align-items-center mb-2"
                            ),
                            html.Div(
                                [
                                    html.I(className="bi bi-exclamation-circle-fill me-2", style={'color': 'gold'}),
                                    # Icon for Acceptable
                                    html.Span(
                                        f"Acceptable: {summary.acceptable_rows} entries, {summary.acceptable_time_in_hours:.1f} hours",
                                        style={'color': 'gold'}
                                        ),
                                ], className="d-flex align-items-center mb-2"
                            ),
                            html.Div(
                                [
                                    html.I(className="bi bi-x-circle-fill me-2", style={'color': 'red'}),
                                    # Icon for Late
                                    html.Span(
                                        f"Late: {summary.late_rows} entries, {summary.late_time_in_hours:.1f} hours",
                                        style={'color': 'red'}
                                        ),
                                ], className="d-flex align-items-center mb-2"
                            ),
                        ], className="mt-4 d-grid gap-2",
                        style={'grid-template-columns': '1fr 1fr'}
                    ),

                    # Insight Summary
                    html.Div(
                        [
                            html.Small(summary_insight, className="text-muted mt-3"),
                        ], className="text-center"
                    )
                ],
                style={'maxHeight': '200px', 'overflowY': 'auto'}
            )
        ], className=f'h-100 shadow-sm'
    )


