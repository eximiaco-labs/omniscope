from dash import html
import dash_bootstrap_components as dbc
from datetime import datetime


def _create_card(title, value, color='primary', is_selected=False):
    title_class = "text-center mb-2" + (" text-white" if is_selected else "")
    return dbc.Col(
        html.Div(
            children=[dbc.Card(
                dbc.CardBody(
                    [
                        html.P(title, className=title_class),
                        html.H1(value, className="card-text text-center")
                    ]
                ),
                color=color,
                outline=not is_selected,
                className="mb-3 h-100 shadow-sm"
            )],
        ),
        lg=4, md=6, sm=12,
        className="mb-3"
    )


def render(active_cases):
    n_active_cases = len(active_cases)
    n_cases_without_description = sum(1 for c in active_cases if not c.has_description)
    n_cases_without_updates = sum(1 for c in active_cases if c.has_description and not c.status)
    n_cases_outdated = sum(
        1 for c in active_cases if c.has_description and c.status and (datetime.now() - c.last_updated).days > 21
    )
    n_cases_critical = sum(1 for c in active_cases if c.has_description and c.status == 'Critical')
    n_cases_requires_attention = sum(1 for c in active_cases if c.has_description and c.status == 'Requires attention')

    return dbc.Row(
        [
            _create_card('Active Cases', n_active_cases),
            _create_card('Without Description', n_cases_without_description),
            _create_card('Without Updates', n_cases_without_updates),
            _create_card('Outdated', n_cases_outdated),
            _create_card('Critical', n_cases_critical, 'danger'),
            _create_card('Requires Attention', n_cases_requires_attention, 'warning'),
        ]
    )
