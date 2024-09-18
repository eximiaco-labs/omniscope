import dash
import dash_bootstrap_components as dbc
from dash import html

import globals
import ui.components.base.datagrid as datagrid
import ui.components.base.title as title


dash.register_page(__name__, title='Omniscope')


def layout(**kwargs):
    funnel = globals.omni.get_salesfunnelb2b_df()

    stage_order = funnel.data[['StageName', 'StageOrderNr']].drop_duplicates().set_index('StageName').sort_values(
        'StageOrderNr'
    ).index

    pivot_df = funnel.data.pivot_table(
        index='AccountManager',
        columns='StageName',
        values='Id',
        aggfunc='count',
        fill_value=0
    ).reset_index()

    pivot_df = pivot_df[['AccountManager'] + list(stage_order)]

    row_one = dbc.Row(
            dbc.Col(
                [
                    title.render(f'Deals by Account Manager', 3),
                    datagrid.summary(f'am_deals_df', pivot_df)
                ]
            )
        )

    activities = globals.omni.get_last_six_weeks_am_activities_df()
    summary = activities.get_weekly_summary(by='AccountManagerName', operation='count', week_column='DueWeek', date_column='DueDate')

    row_two = dbc.Row(
        dbc.Col(
            [
                title.render(f'Account Managers Activities', 3),
                datagrid.summary(f'activities', summary)
            ]
        )
    )

    df = funnel.data[['Title', 'StageName', 'ClientName', 'AccountManagerName', 'DaysSinceLastUpdate']]
    row_three = dbc.Row(
        dbc.Col(
            [
                title.render(f'Deals List', 3),
                datagrid.summary(f'deals', df)
            ]
        )
    )

    return html.Div([
        row_one, row_two, row_three
    ])
