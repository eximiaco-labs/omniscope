import pandas as pd
import dash_bootstrap_components as dbc
import ui.components.base.cards as c
import ui.components.base.colors as colors
import ui.components.base.title as title
from typing import Optional

from dash import html


def render(data: pd.DataFrame, style: Optional[dict] = None):
    total_hours = data['TimeInHs'].sum()
    hours_by_kind = data.groupby('Kind')['TimeInHs'].sum()

    number_of_cols = 1
    has_internal = 'Internal' in hours_by_kind
    if has_internal:
        number_of_cols += 1
    has_consulting = 'Consulting' in hours_by_kind
    if has_consulting:
        number_of_cols += 1
    has_squad = 'Squad' in hours_by_kind
    if has_squad:
        number_of_cols += 1

    width = 12 // number_of_cols

    children = [
        c.create_kpi_card(
            "Total Hours",
            f"{total_hours:.1f}", width=width
        ),
    ]

    if has_squad:
        children.append(
            c.create_kpi_card(
                "Squad Hours",
                f"{hours_by_kind['Squad']:.1f}",
                color=colors.KIND_COLORS['Squad'], width=width
            ),
        )

    if has_consulting:
        children.append(
            c.create_kpi_card(
                "Consulting Hours",
                f"{hours_by_kind['Consulting']:.1f}",
                color=colors.KIND_COLORS['Consulting'], width=width
            )
        )

    if has_internal:
        children.append(
            c.create_kpi_card(
                "Internal Hours",
                f"{hours_by_kind['Internal']:.1f}",
                color=colors.KIND_COLORS['Internal'], width=width
            ),
        )

    return html.Div([
        title.section('Summary'),
        dbc.Row(children)
    ], style=style)
