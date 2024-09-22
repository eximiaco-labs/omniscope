from dash import dcc
import plotly.graph_objs as go

from models.datasets.timesheet_dataset import TimeSheetFieldSummary

import ui.components.base.colors as colors
import ui.components.base.cards as c


def render(tfs: TimeSheetFieldSummary, title: str, aspect: str):
    columns = ['Squad', 'Consulting', 'Internal']
    return c.create_graph_card(
        title,
        dcc.Graph(
            figure={
                'data': [
                            go.Bar(
                                x=tfs.grouped_total_hours.index,
                                y=tfs.grouped_total_hours[kind],
                                name=kind,
                                marker_color=colors.KIND_COLORS[kind]
                            ) for kind in columns if kind in tfs.grouped_total_hours
                        ] + [
                            go.Scatter(
                                x=[tfs.allocation_80, tfs.allocation_80],
                                y=[0, tfs.grouped_total_hours['Total'].max()],
                                mode='lines',
                                name='80% Allocation',
                                line=dict(color='red', dash='dash')
                            )
                        ],
                'layout': go.Layout(
                    barmode='stack',
                    xaxis={'title': aspect},
                    yaxis={'title': 'Hours'},
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
    )
