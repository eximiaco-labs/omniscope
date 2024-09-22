import dash
from dash import html
import dash_bootstrap_components as dbc

import globals
from models.domain.workers import WorkerKind
import ui.components.cards.worker_card as wc
import ui.components.base.title as title

dash.register_page(__name__, title='Omniscope')


def layout(**kwargs):
    people = globals.omni.workers.get_all(kind=WorkerKind.ACCOUNT_MANAGER)
    people = list(people.values())
    people = sorted(people, key=lambda person: person.name)

    return html.Div(
        [
            title.page("Account Managers"),
            dbc.Row(
                [
                    wc.render(person)
                    for person in people
                ], justify='center'
            )
        ]
    )
