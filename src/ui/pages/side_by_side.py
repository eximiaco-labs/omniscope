import dash
import dash_bootstrap_components as dbc
import numpy as np
import pandas as pd
from dash import html, callback, Input, Output

import globals
import models.helpers.slug as sl
import ui.components.allocation.allocation_sidebyside_table as asbst
import ui.components.base.cards as c
import ui.components.base.colors as colors
import ui.components.base.title as title
import ui.components.dataset_selector as selector
from models.base.powerdataframe import PowerDataFrame

dash.register_page(__name__, title='Omniscope')


def summarize_two_datasets_by(column, dataset1, dataset2, col_name1, col_name2):
    if col_name1 == col_name2:
        col_name1 = 'Left'
        col_name2 = 'Right'

    summary1 = dataset1.groupby(column)['TimeInHs'].sum().reset_index()
    column_display = column.removesuffix('Name')

    summary1.columns = [column_display, col_name1]

    summary2 = dataset2.groupby(column)['TimeInHs'].sum().reset_index()
    summary2.columns = [column_display, col_name2]

    merged_summary = pd.merge(summary1, summary2, on=column_display, how='outer').fillna(0)

    merged_summary['Total'] = merged_summary[col_name1] + merged_summary[col_name2]

    merged_summary = merged_summary.sort_values(by='Total', ascending=False).reset_index(drop=True)
    merged_summary.drop(columns=['Total'], inplace=True)

    conditions = [
        merged_summary[col_name2] > merged_summary[col_name1],
        merged_summary[col_name2] < merged_summary[col_name1],
        merged_summary[col_name2] == merged_summary[col_name1]
    ]
    choices = [1, -1, 0]

    merged_summary['Status'] = np.select(conditions, choices, default=0)

    cols = ['Status'] + [col for col in merged_summary.columns if col != 'Status']
    merged_summary = merged_summary[cols]

    return merged_summary


def render_kind_summary(kind: str, left_ds, right_ds, left: str, right: str):
    left_ds = left_ds.data
    right_ds = right_ds.data

    left_ds = left_ds[left_ds['Kind'] == kind]
    right_ds = right_ds[right_ds['Kind'] == kind]

    unique_dates_left = left_ds['Date'].nunique()
    unique_dates_right = right_ds['Date'].nunique()

    avg_timeinhs_left = left_ds['TimeInHs'].sum() / unique_dates_left
    avg_timeinhs_right = right_ds['TimeInHs'].sum() / unique_dates_right

    number_of_clients_left = left_ds['ClientName'].nunique()
    number_of_clients_right = right_ds['ClientName'].nunique()

    kpis = dbc.Row(
        [
            title.section(f'{kind}'),
            dbc.Col(dbc.Row(
                [
                    c.create_kpi_card(f'{kind} Working Days', unique_dates_left, width=4, method=html.H3),
                    c.create_kpi_card(f'Avg. {kind} per day', f'{avg_timeinhs_left:.1f}', width=4, method=html.H3),
                    c.create_kpi_card(f'{kind} Clients', number_of_clients_left, width=4, method=html.H3),
                ]), style={'border-right': '1px solid #ccc'}
            ),
            dbc.Col(dbc.Row(
                [
                    c.create_kpi_card(
                        f'{kind} Working Days', unique_dates_right, width=4,
                        bottom=c.bottom(unique_dates_left, unique_dates_right), method=html.H3
                    ),
                    c.create_kpi_card(
                        f'Avg. {kind} per Day', f'{avg_timeinhs_right:.1f}', width=4,
                        bottom=c.bottom(avg_timeinhs_left, avg_timeinhs_right), method=html.H3
                    ),
                    c.create_kpi_card(
                        f'{kind} Clients', number_of_clients_right, width=4,
                        bottom=c.bottom(number_of_clients_left, number_of_clients_right), method=html.H3
                    ),
                ]
            ))
        ]
    )

    merged = summarize_two_datasets_by(
        'ClientName',
        left_ds,
        right_ds,
        globals.datasets.get_dataset_name_by_slug(left),
        globals.datasets.get_dataset_name_by_slug(right)
    )

    summary_by_client_table = dbc.Row(
        c.create_card(f'{kind} Summary by Client', asbst.render(merged)),
        style={'marginTop': '10px'}
    )

    merged = summarize_two_datasets_by(
        'WorkerName',
        left_ds,
        right_ds,
        globals.datasets.get_dataset_name_by_slug(left),
        globals.datasets.get_dataset_name_by_slug(right)
    )

    summary_by_worker_table = dbc.Row(
        c.create_card(f'{kind} Summary by Worker', asbst.render(merged)),
        style={'marginTop': '10px'}
    )

    merged = summarize_two_datasets_by(
        'ProductsOrServices',
        left_ds,
        right_ds,
        globals.datasets.get_dataset_name_by_slug(left),
        globals.datasets.get_dataset_name_by_slug(right)
    )

    summary_by_products_or_services_table = dbc.Row(
        c.create_card('Summary by Products or Services', asbst.render(merged)),
        style={'marginTop': '10px'}
    )

    return html.Div(
        [
            kpis,
            summary_by_client_table,
            summary_by_worker_table,
            summary_by_products_or_services_table,
        ]
    )


def layout():
    return html.Div(
        [
            title.page('Side-by-side'),
            dbc.Row(
                [
                    dbc.Col(
                        [selector.render('left', default_option='timesheet-previous-week', label='Left')],
                        style={'border-right': '1px solid #ccc'}
                    ),
                    dbc.Col(
                        [selector.render('right', default_option='timesheet-this-week', label='Right')]
                    ),
                ]
            ),
            html.Div(id='side-by-side-content')
        ]
    )

@callback(
    Output({'type': 'dataset-dropdown', 'id': 'right'}, 'value'),
    Input({'type': 'dataset-dropdown', 'id': 'left'}, 'value')
)
def update_right(left):

    all_datasets = [
        sl.generate(f"{dataset['kind']} - {dataset['name']}")
        for dataset in globals.datasets.get_datasets()
        if dataset['kind'].lower() == 'timesheet'
    ]
    if left == 'timesheet-previous-week':
        return 'timesheet-this-week'
    if left.startswith('timesheet-q'):
        result = 'timesheet-this-quarter'
        for dataset in all_datasets:
            if dataset.startswith('timesheet-q') and dataset != left:
                result = dataset
            elif dataset == left:
                return result
    elif left.startswith('timesheet-s'):
        result = 'timesheet-this-semester'
        for dataset in all_datasets:
            if dataset.startswith('timesheet-s') and dataset != left:
                result = dataset
            elif dataset == left:
                return result
    elif not left.startswith('timesheet-t'):
        result = 'timesheet-this-month'
        for dataset in all_datasets:
            if (not dataset.startswith('timesheet-q') and
                    not dataset.startswith('timesheet-t') and
                    not dataset.startswith('timesheet-s') and
                    not dataset.startswith('timesheet-last') and
                    not dataset.startswith('timesheet-p') and
                    dataset != left
            ):
                result = dataset
            elif dataset == left:
                return result

    return 'timesheet-last-six-weeks'


@callback(
    Output('side-by-side-content', 'children'),
    Input({'type': 'dataset-selector-store', 'id': 'left'}, 'value'),
    Input({'type': 'dataset-selector-store', 'id': 'right'}, 'value'),
)
def update_side_by_side_content(left, right):
    if left is None or right is None:
        return html.Div('No datasets selected.')

    left_ds: PowerDataFrame = globals.datasets.get_by_params(left)
    right_ds: PowerDataFrame = globals.datasets.get_by_params(right)

    total_dates_left = left_ds.data['Date'].nunique()
    total_dates_right = right_ds.data['Date'].nunique()
    total_dates_bottom = c.bottom(total_dates_left, total_dates_right)

    total_hours_left = left_ds.data['TimeInHs'].sum()
    total_hours_right = right_ds.data['TimeInHs'].sum()
    total_hours_bottom = c.bottom(total_hours_left, total_hours_right)

    hours_by_kind_left = left_ds.data.groupby('Kind')['TimeInHs'].sum()
    hours_by_kind_right = right_ds.data.groupby('Kind')['TimeInHs'].sum()

    non_billable_left = hours_by_kind_left['Internal'] if 'Internal' in hours_by_kind_left else 0
    non_billable_right = hours_by_kind_right['Internal'] if 'Internal' in hours_by_kind_right else 0
    billable_left = total_hours_left - non_billable_left
    billable_right = total_hours_right - non_billable_right
    billable_bottom = c.bottom(billable_left, billable_right)

    kinds = ['Squad', 'Consulting', 'Internal']
    left_hours = {
        kind: hours_by_kind_left[kind] if kind in hours_by_kind_left else 0
        for kind in kinds
    }

    right_hours = {
        kind: hours_by_kind_right[kind] if kind in hours_by_kind_right else 0
        for kind in kinds
    }

    right_bottoms = {
        kind: c.bottom(left_hours[kind], right_hours[kind])
        for kind in kinds
    }

    title_left = globals.datasets.get_dataset_title_by_params(left)
    title_right = globals.datasets.get_dataset_title_by_params(right)

    result = [title.section('General'), dbc.Row(
        [
            dbc.Col(
                [dbc.Row(
                    html.P(title_left, className='text-center')
                ), dbc.Row(
                    [
                        c.create_kpi_card('Working Days', total_dates_left, 4, bottom="*", method=html.H3),
                        c.create_kpi_card('Working Hours', f'{total_hours_left:.1f}', 4, method=html.H3),
                        c.create_kpi_card('Billable Hours', f'{billable_left:.1f}', 4, method=html.H3),
                    ], className='mb-3'
                ), dbc.Row(
                    [
                        c.create_kpi_card(
                            f"{kind} Hours",
                            f"{left_hours[kind]:.1f}",
                            bottom='*',
                            color=colors.KIND_COLORS[kind], width=4,
                            method=html.H3
                        )
                        for kind in kinds
                    ]
                )], style={'border-right': '1px solid #ccc'}
            ),
            dbc.Col([
                dbc.Row(
                    html.P(title_right, className='text-center')
                ),
                dbc.Row(
                    [
                        c.create_kpi_card('Working Days', total_dates_right, 4, bottom=total_dates_bottom, method=html.H3),
                        c.create_kpi_card('Working Hours', f'{total_hours_right:.1f}', 4, bottom=total_hours_bottom, method=html.H3),
                        c.create_kpi_card('Billable Hours', f'{billable_right:.1f}', 4, bottom=billable_bottom, method=html.H3),
                    ], className='mb-3'
                ),
                dbc.Col(
                    dbc.Row(
                        [
                            c.create_kpi_card(
                                f"{kind} Hours",
                                f"{right_hours[kind]:.1f}",
                                color=colors.KIND_COLORS[kind], width=4,
                                bottom=right_bottoms[kind],
                                method=html.H3
                            )
                            for kind in kinds
                        ]
                    )
                )]
            )
        ], style={'marginTop': '10px'}
    ), dbc.Row(
        [
            ], style={'marginTop': '10px'}
    ), html.Hr(style={'marginBottom': '10px', 'marginTop': '10px'}),
              render_kind_summary('Squad', left_ds, right_ds, left['dataset_slug'], right['dataset_slug']),
              render_kind_summary('Consulting', left_ds, right_ds, left['dataset_slug'], right['dataset_slug'])]

    return result
