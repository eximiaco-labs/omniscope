import pandas as pd

import ui.components.base.cards as c
import ui.components.base.colors as colors
import ui.components.base.title as title

import dash_bootstrap_components as dbc
import plotly.graph_objs as go

from dash import dcc, html
from typing import Optional


def render(data: pd.DataFrame, style: Optional[dict] = None):
    dates_per_kind = data.groupby('Kind')['Date'].nunique()
    total_dates = data['Date'].nunique()

    number_of_cols = 1
    has_internal = 'Internal' in dates_per_kind
    if has_internal:
        number_of_cols += 1
    has_consulting = 'Consulting' in dates_per_kind
    if has_consulting:
        number_of_cols += 1
    has_squad = 'Squad' in dates_per_kind
    if has_squad:
        number_of_cols += 1

    width = 12 // number_of_cols

    children = [
        c.create_kpi_card(
            "Working Days",
            f"{total_dates}", width=width
        ),
    ]

    if has_squad:
        children.append(
            c.create_kpi_card(
                "Squad Days",
                f"{dates_per_kind['Squad']}",
                color=colors.KIND_COLORS['Squad'], width=width
            ),
        )

    if has_consulting:
        children.append(
            c.create_kpi_card(
                "Consulting Days",
                f"{dates_per_kind['Consulting']}",
                color=colors.KIND_COLORS['Consulting'], width=width
            )
        )

    if has_internal:
        children.append(
            c.create_kpi_card(
                "Internal Days",
                f"{dates_per_kind['Internal']}",
                color=colors.KIND_COLORS['Internal'], width=width
            ),
        )

    total_hours_by_date = data.groupby(['Date', 'Kind'])['TimeInHs'].sum().unstack().fillna(0)
    columns = ['Squad', 'Consulting', 'Internal']
    return html.Div([
        title.section('Distribution of working days'),
        dbc.Row(children, style={'marginBottom': '10px'}),
        dbc.Row(
            [
                dbc.Col(
                    c.create_graph_card(
                        "Hours Allocated by Date and Work Type",
                        dcc.Graph(
                            figure={
                                'data': [
                                    go.Bar(
                                        x=total_hours_by_date.index,
                                        y=total_hours_by_date[kind],
                                        name=kind,
                                        marker_color=colors.KIND_COLORS[kind]
                                    ) for kind in columns if kind in total_hours_by_date
                                ],
                                'layout': go.Layout(
                                    barmode='stack',
                                    xaxis={'title': 'Date'},
                                    yaxis={'title': 'Hours Worked'},
                                    showlegend=True,
                                    legend={'orientation': 'h', 'y': -0.2},
                                    plot_bgcolor='rgba(0,0,0,0)',
                                    paper_bgcolor='rgba(0,0,0,0)',
                                    font_color='white',
                                    margin=dict(l=50, r=20, t=20, b=100),
                                    height=400
                                )
                            }
                        )
                    ), width=12
                )
            ]
        )
    ], style=style)



