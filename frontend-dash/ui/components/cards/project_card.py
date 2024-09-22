import dash_bootstrap_components as dbc
from dash import dcc, html
from models.semantic.tasksmanager import Project
from datetime import datetime


def render(project: Project):
    is_late = project.expected_due_date and datetime.now() > project.expected_due_date

    header_footer_color = "#552222" if is_late else None
    body_color = "#220000" if is_late else None

    badges = [
        dbc.Badge(error, color="danger", className="me-1", style={'width': 'auto'})
        for error in project.errors
    ]

    sorted_tasks = sorted(project.tasks, key=lambda task: task.due or datetime.max)
    up_next_task = sorted_tasks[0] if sorted_tasks else None

    header_elements = []
    if project.folder:
        header_elements.append(
            dbc.Badge(
                project.folder.upper(), color="info", className="me-1",
                style={'width': 'auto', 'font-size': '10px', 'padding': '5px', 'margin-bottom': "10px"}
                )
        )

    header_elements.append(
        html.H6(project.name, style={'text-align': 'center'})
    )

    header_style = {"text-align": "center"}
    if is_late:
        header_style["background-color"]=header_footer_color
        header_style["color"]: "white"

    children = [
        dbc.CardHeader(
            children=header_elements,
            style=header_style
        ),
        dbc.CardBody(
            [
                html.P(
                    project.expected_due_date.strftime("%d/%m") if project.expected_due_date else "No due date",
                    className="card-text",
                    style={'text-align': 'center', 'color': 'lightgray', 'margin-bottom': '10px'}
                ),
                html.Div(
                    html.Span(f"Remaining Tasks: {project.number_of_tasks}", className="badge bg-primary me-1"),
                    style={'text-align': 'center', 'margin-bottom': '20px'}
                ),
                html.Div(
                    [
                        html.H6("Up Next:", style={'margin-top': '20px', 'text-align': 'center'}),
                        html.P(
                            up_next_task.content if up_next_task else "No tasks available",
                            className="card-text",
                            style={'text-align': 'center', 'margin-bottom': '5px'}
                        ),
                        html.P(
                            up_next_task.due.strftime("%d/%m") if up_next_task and up_next_task.due else "",
                            className="card-text",
                            style={'text-align': 'center', 'color': 'lightgray'}
                        )
                    ] if up_next_task else [],
                    style={'text-align': 'center', 'margin-top': '20px'}
                )
            ],
            style={
                'position': 'relative',
                'flex': '1 1 auto',
                "background-color": body_color if is_late else "inherit",
                'padding': '20px'
            }
        )
    ]

    if badges:
        children.append(
            dbc.CardFooter(
                html.Div(
                    badges,
                    style={
                        'text-align': 'left',
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '5px'
                    }
                ),
                style={"background-color": header_footer_color} if is_late else {}
            )
        )

    return dbc.Col(
        dcc.Link(
            dbc.Card(
                children,
                className='icon-card',
                style={
                    "width": "100%",
                    "margin": "10px",
                    "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)",
                    "border": "none",
                    "border-radius": "10px",
                    "overflow": "hidden",
                    "position": "relative",
                    "min-height": "350px",
                    "display": "flex",
                    "flex-direction": "column",
                    "justify-content": "space-between"
                },
            ),
            href=f'https://todoist.com/showProject?id={project.id}', target='_blank',
            style={'text-decoration': 'none', 'color': 'inherit'}
        ),
        xs=12,
        sm=12,
        md=6,
        lg=4,
        xl=3
    )
