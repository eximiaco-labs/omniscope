import html

from models.base.powerdataframe import SummarizablePowerDataFrame
import dash_bootstrap_components as dbc
import ui.components.base.title as title
import ui.components.base.datagrid as datagrid

from dash import html
from models.helpers.weeks import Weeks

import ui.components.weekly_actual_graph as wag


def render(data: SummarizablePowerDataFrame, by: str = 'Client'):
    children = []

    previous5 = Weeks.get_previous_string(5)
    previous6 = Weeks.get_previous_string(6)

    data = (data
            .filter_by(by='Correctness', not_equals_to='OK')
            .filter_by(by='Correctness', not_equals_to='Acceptable (1)')
            .filter_by(by='Correctness', not_starts_with='WTF -')
            .filter_by(by='CreatedAtWeek', not_equals_to=previous5)
            .filter_by(by='CreatedAtWeek', not_equals_to=previous6)
            )

    consulting = data.filter_by('Kind', equals_to='Consulting')

    if len(consulting.data) > 0:
        consulting_summary_by_client = consulting.get_weekly_summary(
            by,
            operation='count',
            week_column='CreatedAtWeek',
            date_column='CreatedAt'
            )

        # consulting_summary_by_client.rename(columns={consulting_summary_by_client.columns[0]: 'Client'}, inplace=True)
        children.append(
            dbc.Row(
                dbc.Col(
                    [
                        title.render(f'Consulting Late Timesheet Entries per {by}', 3),
                        wag.render(consulting_summary_by_client),
                        datagrid.summary(f'slug_squads', consulting_summary_by_client)
                    ]
                )
            )
        )

    squads = data.filter_by('Kind', equals_to='Squad')
    if len(squads.data) > 0:
        squads_summary_by_client = squads.get_weekly_summary(
            by,
            operation='count',
            week_column='CreatedAtWeek',
            date_column='CreatedAt'
            )

        children.append(
            dbc.Row(
                dbc.Col(
                    [
                        title.render(f'Squads Late Timesheet Entries per {by}', 3),
                        wag.render(squads_summary_by_client),
                        datagrid.summary(f'slug_squads', squads_summary_by_client)
                    ]
                )
            )
        )

    return html.Div(children=children)
