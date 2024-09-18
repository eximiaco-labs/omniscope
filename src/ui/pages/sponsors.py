import dash
import globals

from dash import html
import dash_bootstrap_components as dbc
import ui.components.cards.sponsor_card as sc
import ui.components.base.title as title

dash.register_page(__name__, title='Omniscope')


def layout():
    sponsors = sorted(globals.omni.sponsors.get_all().values(), key=lambda sponsor: sponsor.name)
    return html.Div(
        [
            title.page('Our Sponsors'),
            dbc.Row([
                sc.render(s)
                for s in sponsors
            ], justify='center')
        ],
    )
