from dash import dcc

from models.base.powerdataframe import SummarizablePowerDataFrame
import dash_bootstrap_components as dbc
import ui.components.base.title as title
import ui.components.base.datagrid as datagrid

import ui.components.weekly_projected_vs_actual_graph as wpa
from datetime import datetime
import ui.components.working_calendar as wc

from dash import html

def render(data: SummarizablePowerDataFrame, by: str = 'Client'):
    children = []
    consulting = data.filter_by('Kind', equals_to='Consulting')

    this_month = datetime.now().month
    this_year = datetime.now().year

    if len(consulting.data) > 0:
        consulting_summary_by_client = consulting.get_weekly_summary(by)
        consulting_bar_graph = wpa.render(consulting_summary_by_client)
        # consulting_summary_by_client.rename(columns={consulting_summary_by_client.columns[0]: 'Client'}, inplace=True)
        children.append(
            dbc.Row(
                dbc.Col(
                    [
                        title.render(f'Consulting Allocation Time per {by}', 3),
                        dcc.Tabs([
                            dcc.Tab(consulting_bar_graph, label='Graph'),
                            dcc.Tab(datagrid.summary(f'consulting', consulting_summary_by_client), label='Summary'),
                            dcc.Tab(dbc.Row([
                                dbc.Col(
                                    wc.render(this_year, this_month, consulting),
                                ),
                            ]), label='This Month'),

                        ])
                    ]
                )
            )
        )

    squads = data.filter_by('Kind', equals_to='Squad')
    if len(squads.data) > 0:
        squads_summary_by_client = squads.get_weekly_summary(by)
        squads_bar_graph = wpa.render(squads_summary_by_client)
        children.append(
            dbc.Row(
                dbc.Col(
                    [
                        title.render(f'Squads Allocation Time per {by}', 3),
                        dcc.Tabs([
                            dcc.Tab(squads_bar_graph, label='Graph'),
                            dcc.Tab(datagrid.summary(f'consulting', squads_summary_by_client), label='Summary'),
                            dcc.Tab(dbc.Row([
                                dbc.Col(
                                    wc.render(this_year, this_month, squads),
                                ),
                            ]), label='This Month'),

                        ])
                    ]
                )
            )
        )

    return html.Div(children=children)
