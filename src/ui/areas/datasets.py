import dash_ag_grid as dag
import dash_bootstrap_components as dbc
import pandas as pd
from dash import callback, dcc, html, Input, Output
import plotly.express as px

import ui.components.allocation.allocation_by_case as by_case
import ui.components.allocation.allocation_by_client as abc
import ui.components.allocation.allocation_by_kind as abk
import ui.components.allocation.allocation_by_worker as abw
import ui.components.allocation.allocation_by_working_day as abwd
import ui.components.last_six_weeks_work_summary as lswws

import globals
import ui.components.dataset_selector as selector


def __render_dataframe_to(dataset_slug: str, df: pd.DataFrame, columns_to_display=None, style=None):
    if not style:
        style = {}

    style['width'] = '100%'
    style['margin-top'] = '5px'

    def generate_column_defs(df, columns_to_display):
        columns = columns_to_display if columns_to_display else df.columns
        return [{'field': col, 'headerName': col, 'unsafe_allow_html': True} for col in columns]

    def generate_records(df, columns_to_display):
        return df[columns_to_display].to_dict(orient='records') if columns_to_display else df.to_dict(orient='records')

    grid = dag.AgGrid(
        id='dataset-records',
        rowData=generate_records(df, columns_to_display),
        columnDefs=generate_column_defs(df, columns_to_display),
        defaultColDef={"filter": True},
        dashGridOptions={
            'animateRows': False,
            'rowSelection': 'single',
            'getRowId': {'params': {'key': df.columns[0]}}
        },
        csvExportParams={
            "fileName": f"{dataset_slug}.csv",
        },
        style=style,
    )

    return html.Div(
        [
            html.Button("Download CSV", id="csv-button", n_clicks=0),
            grid]
    )


def render(**kwargs):
    result = html.Div(
        [
            selector.render('datasets-dropdown', dataset_kind=None, default_option=None, filters=kwargs),
            dcc.Store(id='dataset-params-store'),
            html.Div(id='plain-output'),
            dbc.Card(
                children=[
                    dbc.CardHeader('Output'),

                    dbc.CardBody(
                        [
                            dbc.Accordion(
                                children=[

                                    dbc.AccordionItem(
                                        [
                                            html.Div(id='fields-area'),
                                            html.Div(id='records-area')
                                        ], title='Records'
                                    ),
                                ], always_open=True
                            )
                        ], style={'padding': '10px'}
                    )], style={'margin-top': '10px'}
            ),
        ]
    )

    return result


@callback(
    Output('dataset-params-store', 'data'),
    Output('fields-area', 'children'),
    Input({'type': 'dataset-selector-store', 'id': 'datasets-dropdown'}, 'value')
)
def update_fields_area(params: str):
    dss = globals.datasets.get_dataset_source_by_params(params)
    if not dss:
        return None, None

    options = [{'label': col, 'value': col} for col in dss.get_all_fields()]
    value = dss.get_common_fields()
    fields_dropdown = dcc.Dropdown(
        id='fields-dropdown',
        options=options,
        value=value,
        placeholder="Fields to display",
        multi=True
    )

    return params, fields_dropdown


@callback(
    Output('records-area', 'children'),
    Output('plain-output', 'children'),
    Input('fields-dropdown', 'value'),
    Input('dataset-params-store', 'data'),
)
def update_datasets_output(columns, params):
    source = globals.datasets.get_dataset_source_by_params(params)
    df = globals.datasets.get_by_params(params)
    data: pd.DataFrame = df.data

    dataset_slug: str = params['dataset_slug']

    if dataset_slug.startswith('timesheet'):
        plain_output = html.Div([
            abk.render(data, style={'margin-bottom': '10px'}),
            abc.render(data, style={'margin-bottom': '10px'}),
            abwd.render(data, style={'margin-bottom': '10px'}),
            lswws.render(df, params['dataset_slug']),
            abw.render(data, style={'margin-bottom': '10px'}),
            by_case.render(data, style={'margin-bottom': '10px'}),
        ])
    else:
        plain_output = html.Div([])

    data['All'] = 'All'
    data['Unit'] = 1
    ag_value, _ = source.get_treemap_path()

    records_area = html.Div(
        [
            __render_dataframe_to(params['dataset_slug'], data, columns),
        ]
    )

    return records_area, plain_output


@callback(
    Output("dataset-records", "exportDataAsCsv"),
    Input("csv-button", "n_clicks"),
)
def export_data_as_csv(n_clicks):
    if n_clicks:
        return True
    return False
