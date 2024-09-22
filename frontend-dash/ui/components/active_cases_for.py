from dash import html
import dash_bootstrap_components as dbc
import ui.components.cards.case_card as cc
from ui.components.base import title
import globals

from typing import Callable
from models.domain.cases import Case


def render(filter_by: Callable[[Case], bool]):
    cases = globals.omni.cases.get_all()

    active_cases = [
        cc.render(case)
        for case in cases.values()
        if case.is_active and filter_by(case)
    ]

    if len(active_cases) == 0:
        return html.Div()

    return html.Div(
        [
            title.render('Active Cases'),
            dbc.Row(active_cases, justify='center')
        ],
        style={'padding': '20px'}
    )
