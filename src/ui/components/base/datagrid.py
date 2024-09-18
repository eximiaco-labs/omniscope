import pandas as pd
import dash
from dash import html
import dash_ag_grid as dag
import logging

logging.basicConfig(level=logging.INFO)

app = dash.Dash(__name__)


def summary(component_id: str, df: pd.DataFrame):
    return raw(component_id, df)


def raw(component_id: str, df: pd.DataFrame, style=None):
    if not style:
        style = {}

    row_height = 42
    header_height = 96

    style['width'] = '100%'
    # style['height'] = f'{row_height * len(df) + header_height}px'
    style['height'] = "450px"

    def generate_column_defs(df):
        result = []
        ml_dict = {}

        for column in df.columns:
            if isinstance(column, tuple):
                level0, level1 = column
            else:
                level0, level1 = column, ''

            column_def = {'field': level0, 'unsafe_allow_html': True}
            if level1 == '':
                if df.columns[0] == column:
                    column_def['cellRenderer'] = 'OmniHtml'
                result.append(column_def)
            else:
                if level0 not in ml_dict:
                    ml_dict[level0] = {'headerName': level0, 'children': [], 'unsafe_allow_html': True}
                    result.append(ml_dict[level0])

                ml_dict[level0]['children'].append(
                    {'field': f'{level0}_{level1}', 'headerName': level1, 'unsafe_allow_html': True}
                )

        return result

    def generate_records(df):
        copy = df
        if isinstance(df.columns[0], tuple):
            copy = df.copy()
            copy.columns = [f"{level0}_{level1}" if level1 else level0 for level0, level1 in copy.columns]

        return copy.to_dict(orient='records')

    grid = dag.AgGrid(
        id=component_id,
        rowData=generate_records(df),
        columnDefs=generate_column_defs(df),
        defaultColDef={"filter": True},
        dashGridOptions={
            'animateRows': False,
            'rowSelection': 'single',
            'getRowId': {'params': {'key': df.columns[0]}}
        },
        style=style,
        columnSize="responsiveSizeToFit"
    )

    return html.Div(
        [
            grid,
        ]
    )

