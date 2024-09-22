import dash_bootstrap_components as dbc
import html as h
from dash import html, dcc, callback, Input, Output, no_update
import ui.components.login_info as li
import globals

# Lista de páginas disponíveis


def render():
    workers = globals.omni.workers.get_all().values()

    pages = [
        {'label': 'Home', 'value': '/'},
        {'label': 'Refresh', 'value': '/hit-refresh'},
        {'label': 'Projects', 'value': '/projects'},
        {'label': 'Clients', 'value': '/clients'},
        {'label': 'Cases', 'value': '/cases'},
        {'label': 'Sponsors', 'value': '/sponsors'},
        {'label': 'Side by Side', 'value': '/side-by-side'},
        {'label': 'Week Review', 'value': '/week-review'},
        {'label': 'About', 'value': '/about'}
    ]

    for worker in workers:
        page = {'label': worker.name, 'value': worker.omni_url}
        pages.append(page)

    clients = globals.omni.clients.get_all().values()
    for client in clients:
        page = {'label': client.name, 'value': client.omni_url}
        pages.append(page)

    cases = globals.omni.cases.get_all().values()
    for case in cases:
        page = {'label': case.title, 'value': case.omni_url}
        pages.append(page)

    sponsors = globals.omni.sponsors.get_all().values()
    for sponsor in sponsors:
        page = {'label': sponsor.name, 'value': sponsor.omni_url}
        pages.append(page)

    # datasets = globals.datasets.get_datasets()
    # for dataset in datasets:
    #     s = slug.generate(f"{dataset['kind']} - {dataset['name']}")
    #     page = {
    #         'label': f"{dataset['kind']} - {dataset['name']}",
    #         'value': f'/datasets/?name={s}',
    #     }
    #     pages.append(page)

    navbar = dbc.Navbar(
        dbc.Container(
            [
                dbc.NavbarBrand("Omniscope", href='/'),
                dbc.Row(
                    [
                        dbc.Col(
                            dcc.Dropdown(
                                id='navbar-search-dropdown',
                                options=pages,
                                placeholder='Search...',
                                style={'width': '100%'},
                                className="bg-dark text-light"
                            ),
                            width={"size": 6, "offset": 3},  # Center the search box
                            className="d-none d-md-block",  # Hide on small screens
                        ),
                    ],
                    className="flex-grow-1",
                    align="center",
                ),
                html.Div(
                    [
                        html.Div(id='login-info'),
                    ],
                    className="ms-auto",
                ),
            ],
            fluid=True,
        ),
        color="primary",
        dark=True,
        className="fixed-top"
        ##style={'position': 'fixed'}
    )

    return navbar


@callback(Output("login-info", "children"), Input("login-info", "id"))
def update_login_info(_):
    return li.render()

@callback(
    Output('url', 'pathname'),
    Input('navbar-search-dropdown', 'value')
)
def update_url(value):
    if value:
        result = h.unescape(value)
        return result
    return no_update


