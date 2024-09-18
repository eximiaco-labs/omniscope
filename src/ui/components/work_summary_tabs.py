from models.base.powerdataframe import SummarizablePowerDataFrame
import pandas as pd
from datetime import datetime
from typing import Optional
from dash import html, dcc
import dash_bootstrap_components as dbc
import ui.components.working_calendar as wc

import ui.components.weekly_projected_vs_actual_graph as wpa
from ui.components.base import datagrid


def render_kind(source: SummarizablePowerDataFrame,
                kind: Optional[str] = 'Consulting',
                by_client: Optional[bool] = True,
                by_worker: Optional[bool] = True,
                by_case: Optional[bool] = True,
                ):
    if len(source.data) == 0:
        return html.Div()

    by_kind = source.filter_by('Kind', equals_to=kind)
    items = []

    if len(by_kind.data) == 0:
        return html.Div()

    summary_by = by_kind.get_weekly_summary('Client')
    bar_graph = wpa.render(summary_by, actual_color="#228B22" if kind == 'Consulting' else 'cyan')

    items.append(dbc.AccordionItem(bar_graph, title='Graph'))

    if by_client:
        items.append(dbc.AccordionItem(datagrid.summary(f'by_client', summary_by), title='by Client', ))

    if by_worker:
        summary_by = by_kind.get_weekly_summary('Worker')
        items.append(dbc.AccordionItem(datagrid.summary(f'by_worker', summary_by), title='by Worker', ))

    if by_case:
        summary_by = by_kind.get_weekly_summary('Case')
        items.append(dbc.AccordionItem(datagrid.summary(f'by_case', summary_by), title='by Case', ))

    this_month = datetime.now().month
    this_year = datetime.now().year

    items.append(dbc.AccordionItem(dbc.Row([
        dbc.Col(
            wc.render(this_year, this_month, source),
        ),
    ]), title='This Month', ))

    return dbc.Accordion(items, always_open=True)


def render(source: SummarizablePowerDataFrame,
           by_client: Optional[bool] = True,
           by_worker: Optional[bool] = True,
           by_case: Optional[bool] = True,
           ):
    if len(source.data) == 0:
        return html.Div()

    tabs = []

    consulting = source.filter_by('Kind', equals_to="Consulting")
    if len(consulting.data) != 0:
        tabs.append(dbc.Tab(
            render_kind(consulting, 'Consulting', by_client, by_worker, by_case),
            label='Consulting')
        )

    squads = source.filter_by('Kind', equals_to="Squad")
    if len(squads.data) != 0:
        tabs.append(dbc.Tab(
            render_kind(squads, 'Squad', by_client, by_worker, by_case),
            label='Squads')
        )

    return dbc.Tabs(tabs)
