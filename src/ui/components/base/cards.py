from dash import html, dcc
import numbers
import dash_bootstrap_components as dbc
from datetime import date, datetime
import pandas as pd
from dash_bootstrap_components import Card

import models.datasets.timesheet_dataset as tsds
from ui.helpers.beaulty import format_date_with_suffix
import ui.components.base.colors as colors

import plotly.express as px
import plotly.graph_objects as go


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


def create_day_card(date: datetime, date_of_interest: datetime, dataset: pd.DataFrame, max_value=None) -> Card:
    day_of_week = date.strftime('%A')
    is_the_day = date.date() == date_of_interest.date()
    is_future = date.date() > date_of_interest.date()

    text_color = "#333333" if is_future else ("white" if is_the_day else "lightgray")
    opacity = "opacity-75" if is_future else ""
    worst_color = 'Red' if not is_future else '#333333'
    avg_color = 'White' if not is_future else '#333333'
    best_color = 'Green' if not is_future else '#333333'
    #total_hours_color = 'white' if not is_future else '#333333'

    s = tsds.TimesheetDateAnalysis(dataset, date, number_of_weeks=6)

    figure = create_day_card_figure(s, max_value)
    if is_future:
        disable_day_card_figure(figure)

    return dbc.Card(
        html.A(
            [
                dbc.CardHeader(
                    [
                        html.P(day_of_week, style={'color': text_color}, className=f"fw-bold mb-1"),
                        html.Small(format_date_with_suffix(date), style={'color': text_color}, className=f"fw-bold")
                    ],
                    className="bg-light text-center p-2"
                ),
                dbc.CardBody(
                    [
                        dcc.Graph(figure=figure, config={'displayModeBar': False, 'staticPlot': True}),
                    ], style={'padding': '0px', 'margin': '0px'},
                ),
                dbc.CardFooter(
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
            ],
            href="#",
            id={'type': 'day-card', 'index': date.strftime('%Y-%m-%d')},
            className="text-decoration-none"
        ),
        className=f'h-100 shadow-sm {opacity} cursor-pointer'
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
        height=150
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
