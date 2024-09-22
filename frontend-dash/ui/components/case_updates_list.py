import dash_bootstrap_components as dbc
from dash import html, dcc
import ui.components.base.title as title


def render_item(event):
    status_color = {
        "All right": "success",
        "Requires attention": "warning",
        "Critical": "danger"
    }

    return dbc.ListGroupItem(
        [
            html.Div(
                [
                    html.Div(
                        [
                            html.Span(
                                event.status.upper(),  # Texto do status em maiúsculo
                                className=f"badge bg-{status_color[event.status]} p-2",  # Badge com mais destaque
                                style={"fontSize": "1.2em"}
                            ),
                            html.Span(
                                event.author or 'N/A',
                                style={"marginLeft": "10px", "fontWeight": "bold"}
                            ),
                        ],
                        style={"display": "flex", "alignItems": "center"}
                    ),
                    html.P(
                        event.date.strftime('%d-%m-%Y'),
                        style={"position": "absolute", "top": "10px", "right": "10px", "fontWeight": "bold"}
                    ),
                    html.Div(
                        dcc.Markdown(
                            event.observations,
                            dangerously_allow_html=True,
                        ),
                        style={
                            "border": "1px solid #ddd",
                            "padding": "10px",
                            "borderRadius": "5px",
                            "marginTop": "10px",
                        }
                    ),
                ],
                style={"position": "relative"}
            )
        ]
    )


def render(case):
    if not case.updates or len(case.updates) == 0:
        return html.Div()

    return html.Div([
        title.render('Recent Updates', 3),
        dbc.ListGroup(
                [
                    render_item(event)
                    for event in case.updates
                ]
        )
    ])

