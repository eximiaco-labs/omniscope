from dash import dcc, html
import plotly.graph_objs as go
import pandas as pd
import dash_bootstrap_components as dbc
import ui.components.base.colors as colors
import ui.components.base.cards as c

from models.datasets.timesheet_dataset import TimeSheetFieldSummary
import ui.components.allocation.timesheet_field_graph as tfg


def render(data: pd.DataFrame):
    if len(data) == 0:
        return html.Div()

    tfs = TimeSheetFieldSummary(data, 'ProductsOrServices')
    return html.Div(
        [
            dbc.Row([
                c.create_kpi_card('Products or Services', tfs.unique, 4),
                c.create_kpi_card('Avg. Hours per POS', f'{tfs.avg_hours:.1f} hrs', 4),
                c.create_kpi_card('Std. Hours per POS', f'{tfs.std_hours:.1f}', 4),
            ], style={'marginBottom': '10px'}),
            dbc.Row(tfg.render(tfs, 'Hours by Products or Services', 'Products or Services'))
        ]
    )
