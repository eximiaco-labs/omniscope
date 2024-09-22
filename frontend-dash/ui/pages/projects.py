import dash
from dash import html, dcc, callback, Input, Output, State
import dash_bootstrap_components as dbc

import globals
from datetime import datetime
import ui.components.cards.project_card as pc
import ui.components.base.title as title

dash.register_page(__name__, title='Omniscope')


def create_card(title, value, color, is_selected):
    title_class = "text-center mb-2" + (" text-white" if is_selected else "")
    return dbc.Card(
        dbc.CardBody(
            [
                html.P(title, className=title_class),
                html.H1(value, className="card-text text-center")
            ]
        ),
        color=color,
        outline=not is_selected,
        className="mb-3 h-100 shadow-sm"
    )


def layout(**kwargs):
    projects = list(globals.omni.projects.get_all().values())
    projects.sort(key=lambda x: x.expected_due_date or datetime.max)

    folders = sorted(set(project.folder for project in projects if project.folder))

    folders_dropdown = dcc.Dropdown(
        id='folders-dropdown',
        options=folders,
        placeholder="What folders do you want to see?",
        value=folders,
        multi=True
    )

    return html.Div(
        [
            folders_dropdown,
            dbc.Container(
                [
                    dcc.Store(id='selected-card', data=0),
                    dbc.Row(
                        [
                            dbc.Col(
                                html.Div(
                                    id='active-projects-div',
                                    children=[],
                                    n_clicks=0,
                                    style={'cursor': 'pointer'}
                                ),
                                lg=4, md=6, sm=12,
                                className="mb-3"
                            ),
                            dbc.Col(
                                html.Div(
                                    id='delayed-tasks-div',
                                    children=[],
                                    n_clicks=0,
                                    style={'cursor': 'pointer'}
                                ),
                                lg=4, md=6, sm=12,
                                className="mb-3"
                            ),
                            dbc.Col(
                                html.Div(
                                    id='delayed-projects-div',
                                    children=[],
                                    n_clicks=0,
                                    style={'cursor': 'pointer'}
                                ),
                                lg=4, md=6, sm=12,
                                className="mb-3"
                            ),
                        ], className="mt-4"
                    )
                ], fluid=True
            ),
            dbc.Row(id="projects-area")
        ]
    )


@callback(
    Output('selected-card', 'data'),
    [Input('active-projects-div', 'n_clicks'),
     Input('delayed-tasks-div', 'n_clicks'),
     Input('delayed-projects-div', 'n_clicks')],
    [State('selected-card', 'data')]
)
def select_card(active_clicks, delayed_tasks_clicks, delayed_projects_clicks, selected_card):
    ctx = dash.callback_context
    if not ctx.triggered:
        return selected_card

    clicked_id = ctx.triggered[0]['prop_id'].split('.')[0]

    if clicked_id == 'active-projects-div':
        return 0
    elif clicked_id == 'delayed-tasks-div':
        return 1
    elif clicked_id == 'delayed-projects-div':
        return 2
    return selected_card


@callback(
    Output('projects-area', 'children'),
    Output('active-projects-div', 'children'),
    Output('delayed-tasks-div', 'children'),
    Output('delayed-projects-div', 'children'),
    Input('folders-dropdown', 'value'),
    Input('selected-card', 'data')
)
def update_projects_area(folders, selected_card):
    all_projects = list(globals.omni.projects.get_all().values())

    filtered_projects = [project for project in all_projects if not folders or project.folder in folders]
    filtered_projects.sort(key=lambda x: x.expected_due_date or datetime.max)
    number_of_projects = len(filtered_projects)

    n_delayed_tasks = sum(1 for p in filtered_projects if p.has_late_tasks)
    n_delayed_projects = sum(
        1 for p in filtered_projects if p.expected_due_date and datetime.now() > p.expected_due_date
    )

    if selected_card == 1:
        filtered_projects = [p for p in filtered_projects if p.has_late_tasks]
    elif selected_card == 2:
        filtered_projects = [p for p in filtered_projects if
                             p.expected_due_date and datetime.now() > p.expected_due_date]

    spotlight = [pc.render(project) for project in filtered_projects if project.is_favorite]
    other_projects = [pc.render(project) for project in filtered_projects if not project.is_favorite]

    result = []

    df = globals.datasets.tasks.get().data
    projects_ids = [p.id for p in filtered_projects]
    df = df[df['ProjectId'].isin(projects_ids)]

    df_late_tasks = df[df['IsLate'] == True]
    late_tasks_count = df_late_tasks.groupby('WorkerName').size().reset_index(name='LateTaskCount')
    late_tasks_count = late_tasks_count.sort_values(by='LateTaskCount', ascending=False)
    late_tasks_count.columns = ['Worker', 'Delayed Tasks']

    result.extend(
        [
            title.render('People with Delayed Tasks', 3),
            dbc.Table.from_dataframe(late_tasks_count, striped=True, bordered=True, hover=True)
        ]
    )

    if spotlight:
        result.extend([title.render('Spotlight', 3), *spotlight])
    if other_projects:
        result.extend([title.render('Other Projects' if spotlight else "Projects", 3), *other_projects])

    return (
        result,
        create_card("Active Projects", number_of_projects, "primary", selected_card == 0),
        create_card("Projects with Delayed Tasks", n_delayed_tasks, "warning", selected_card == 1),
        create_card("Delayed Projects", n_delayed_projects, "danger", selected_card == 2)
    )
