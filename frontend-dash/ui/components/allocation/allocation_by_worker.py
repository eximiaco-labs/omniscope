from dash import html
import pandas as pd
import dash_bootstrap_components as dbc
import ui.components.base.cards as c
import ui.components.base.title as title

from models.datasets.timesheet_dataset import TimeSheetFieldSummary
import ui.components.allocation.timesheet_field_graph as tfg
from typing import Optional


def render(data: pd.DataFrame, style: Optional[dict] = {}):
    tfs = TimeSheetFieldSummary(data, 'WorkerName')

    if tfs.no_data or tfs.unique <= 1:
        return html.Div()

    return html.Div(
        [
            title.section('Who are working'),
            dbc.Row([
                c.create_kpi_card('Unique Workers', tfs.unique, 4),
                c.create_kpi_card('Avg. Hours per Worker', f'{tfs.avg_hours:.1f} hrs', 4),
                c.create_kpi_card('Std. Hours per Worker', f'{tfs.std_hours:.1f}', 4),
            ], style={'marginBottom': '10px'}),
            dbc.Row(tfg.render(tfs, 'All Workers by Hours', 'Workers')),
        ], style=style
    )
