import dash
from dash import dcc, html, callback, Input, Output, State, ALL, MATCH, ctx, set_props
import dash_bootstrap_components as dbc

from typing import Optional
import pandas as pd
import globals
import models.helpers.slug as sl
import re


def render(
        dropdown_id: str,
        dataset_kind: Optional[str] = 'timesheet',
        default_option: Optional[str] = 'timesheet-last-six-weeks',
        label: Optional[str] = 'Dataset',
        render_filters: Optional[bool] = True,
        filters: Optional[dict] = {},
        enforce_filters: Optional[bool] = True
):
    dropdown_options = [
        {
            'label': f"{dataset['kind']} - {dataset['name']}",
            'value': sl.generate(f"{dataset['kind']} - {dataset['name']}")
        }
        for dataset in globals.datasets.get_datasets()
        if (dataset_kind is None) or (dataset['kind'].lower() == dataset_kind.lower())
    ]

    children = [
        html.Div(
            [
                dbc.Label(label),
                dcc.Dropdown(
                    id={'type': 'dataset-dropdown', 'id': dropdown_id},
                    options=dropdown_options,
                    placeholder="Select a dataset",
                    value=default_option,
                ),

            ],
            className='mb-3'
        ),
        dcc.Store(id={'type': 'dataset-selector-store', 'id': dropdown_id}),
        dcc.Store(
            id={'type': 'dataset-filters-params-store', 'id': dropdown_id}, data={
                'filters': filters,
                'enforce_filters': enforce_filters
            }
        ),
        html.Div(
            id={'type': 'dataset-selector-filter-area', 'id': dropdown_id},
            style={'display': 'none'} if not render_filters else {'display': 'block'}
        ),
    ]

    return html.Div(
        children
    )


@callback(
    [
        Output({'type': 'dataset-selector-filter-area', 'id': ALL}, 'children'),
        Output({'type': 'dataset-selector-store', 'id': ALL}, 'value'),
        Output({'type': 'dataset-dropdown', 'id': ALL}, 'options'),
    ],
    [
        Input({'type': 'dataset-dropdown', 'id': ALL}, 'value'),
        Input({'type': 'filter-dropdown', 'id': ALL, 'index': ALL}, 'value'),
        Input({'type': 'dataset-dropdown', 'id': ALL}, 'id'),
        Input({'type': 'dataset-selector-filter-area', 'id': ALL}, 'id'),
        Input({'type': 'filter-dropdown', 'id': ALL, 'index': ALL}, 'id'),
        State({'type': 'dataset-filters-params-store', 'id': ALL}, 'data'),
        State({'type': 'dataset-dropdown', 'id': ALL}, 'options'),
    ],
)
def update_dataset_selector_filter_area(selection, filter_values, dropdown_ids, filter_area_ids, filter_ids,
                                        filters_params, current_dropdown_options):

    ctx = dash.callback_context

    result_a = []
    result_b = []

    for selection_idx in range(len(dropdown_ids)):
        dataset_slug = selection[selection_idx]
        context_name = dropdown_ids[selection_idx].get('id')

        if isinstance(ctx.triggered_id, dict):
            if ctx.triggered_id.get('type') == 'dataset-dropdown':
                if ctx.triggered_id.get('id') == context_name:
                    options = current_dropdown_options[selection_idx]
                    if not any(item['value'] == dataset_slug for item in options):
                        options.append({'label': dataset_slug, 'value': dataset_slug})

        params = filters_params[selection_idx]
        enforce_filters = params.get('enforce_filters', True)
        filters_defaults: dict = params['filters']

        source = globals.datasets.get_dataset_source_by_slug(dataset_slug)
        df = globals.datasets.get_by_slug(dataset_slug)
        data: pd.DataFrame = df.data

        if enforce_filters:
            for column, value in filters_defaults.items():
                data = data[data[column] == value]

        filter_ids_and_values = zip(filter_ids, filter_values)

        contextual_filter_values = [
            value
            for id, value in filter_ids_and_values
            if id and id['id'] == context_name
        ]

        filterable_fields = source.get_filterable_fields()
        active_filters = {}

        for idx in range(len(filterable_fields)):
            active_filters[filterable_fields[idx]] = None

            if len(contextual_filter_values) > 0:
                active_filters[filterable_fields[idx]] = contextual_filter_values[idx]

            if active_filters[filterable_fields[idx]] is None:
                if filterable_fields[idx] in filters_defaults:
                    active_filters[filterable_fields[idx]] = [filters_defaults[filterable_fields[idx]]]

        contextual_filter_values = list(active_filters.values())

        filters = []

        def convert_to_label(text):
            if text.endswith("Name"):
                text = text[:-4]

            result = re.sub(r'(?<!^)(?=[A-Z])', ' ', text)
            return result

        for filter in filterable_fields:
            filter_value = active_filters.get(filter, None)

            if len(data) > 0:
                options = [
                    {'label': val, 'value': val}
                    for val in data[filter].drop_duplicates().sort_values()
                ]
                filters.append(
                    html.Tr(
                        [
                            html.Td(
                                dbc.Label(
                                    convert_to_label(filter),
                                    className='text-end',
                                    style={'background-color': 'black'}
                                ),
                                style={'white-space': 'nowrap', 'width': '1%'}
                            ),
                            html.Td(
                                dcc.Dropdown(
                                    id={'type': 'filter-dropdown', 'id': context_name, 'index': filter},
                                    options=options,
                                    multi=True,
                                    value=filter_value,
                                ),
                                style={'width': '100%', 'background-color': 'black'}
                            )
                        ],
                        style={'display': 'none'} if (enforce_filters and filter in filters_defaults) or len(
                            options
                            ) <= 1
                        else {'display': 'table-row'}
                    )
                )

                if filter_value:
                    data = data[data[filter].isin(filter_value)]

        result_a.append(dbc.Table(
            filters,
            bordered=False,
            responsive=True,
            style={'width': '100%'}
        ))

        result_b.append({'dataset_slug': dataset_slug, 'filter_values': contextual_filter_values,
                        'context_name': context_name})

    result = result_a, result_b, current_dropdown_options
    return result


