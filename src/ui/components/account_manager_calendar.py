from dash import dash, callback, html, dcc, Input, Output, callback_context as ctx, ALL
import dash_bootstrap_components as dbc
import calendar
from datetime import datetime
from itertools import cycle

import globals

def render(year, month, account_manager_name: str, df):
    df = (df.filter_by('AccountManagerName', account_manager_name))

    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(year, month)
    today = datetime.today().date()

    table_header = [
        html.Thead(
            html.Tr(
                [html.Th(day, className="bg-secondary", style={"text-align": "center", "padding": "10px"}) for day in
                 ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]]
            )
        )
    ]

    def calculate_work(date):
        records = (df
                   .filter_by('UpdateYear', equals_to=date.year)
                   .filter_by('UpdateMonth', equals_to=date.month)
                   .filter_by('UpdateDay', equals_to=date.day)
                   )
        return records.len()

    # Adjusting month and year for previous and next months
    prev_month_year, prev_month = (year, month - 1) if month > 1 else (year - 1, 12)
    next_month_year, next_month = (year, month + 1) if month < 12 else (year + 1, 1)

    # Computing days for previous and next months
    prev_month_days = cal.monthdayscalendar(prev_month_year, prev_month)[-1]
    next_month_days = cal.monthdayscalendar(next_month_year, next_month)[0]

    table_rows = []
    for idx_week, week in enumerate(month_days):
        row = []
        for idx_day, day in enumerate(week):
            if day == 0:
                if idx_week == 0:
                    day = prev_month_days[idx_day]
                    date = datetime(prev_month_year, prev_month, day)
                    cell_style = {"color": "grey"}
                else:
                    day = next_month_days[idx_day]
                    date = datetime(next_month_year, next_month, day)
                    cell_style = {"color": "grey"}
            else:
                date = datetime(year, month, day)
                cell_style = {}

            work = calculate_work(date)
            cell_style.update(
                {
                    "text-align": "left", "font-size": "0.8em", "padding": "5px",
                    "width": "100px", "height": "65px",
                    "cursor": "pointer"  # Adiciona o cursor de ponteiro
                }
            )

            if date.date() == today:
                cell_style.update({"background-color": "var(--bs-primary)", "color": "white"})

            cell_id = {"type": "cell", "date": date.strftime('%Y-%m-%d')}

            cell = html.Td(
                html.Div(
                    [
                        html.Div([html.Small(day)], style={"text-align": "left", "font-size": "0.8em"}),
                        html.Div(
                            html.P(work, style={"font-size": "1.2em", "font-weight": "bold"}) if work > 0 else html.P(
                                ""
                                ),
                            style={"text-align": "center", "margin-top": "10px"}
                        ),
                    ], style={"height": "50px"}
                )
                , style=cell_style, id=cell_id, n_clicks=0
            )
            row.append(cell)

        table_rows.append(html.Tr(row))

    table_body = [html.Tbody(table_rows)]

    table = dbc.Table(table_header + table_body, bordered=True, hover=True, responsive=True, className="calendar-table")

    return html.Div(
        [
            table,
            dcc.Store(id='account_manager_name', data=account_manager_name),
            dcc.Store(id="selected-date-store"),
            html.Div(id="date-output")
        ]
    )


@callback(
    [Output("selected-date-store", "data"),
     Output("date-output", "children")],
    [Input({"type": "cell", "date": ALL}, "n_clicks"),
     Input('account_manager_name', 'data'), ]
)
def update_output(n_clicks_list, account_manager_name):
    triggered = ctx.triggered_id
    if triggered:
        clicked_date = triggered["date"]
        date = datetime.strptime(clicked_date, "%Y-%m-%d")
        df = (globals.omni.get_last_six_weeks_am_activities_df()
              .filter_by('UpdateYear', equals_to=date.year)
              .filter_by('UpdateMonth', equals_to=date.month)
              .filter_by('UpdateDay', equals_to=date.day)
              .filter_by('AccountManagerName', equals_to=account_manager_name)
              )

        data = df.data

        rows = []
        colors = cycle(["light", "secondary"])

        for line, (_, row) in enumerate(data.iterrows(), start=1):
            color = next(colors)

            card_header = dbc.Row(
                [
                    dbc.Col(
                        dbc.Badge(row['Type'], color="primary", className="mr-1"), width="auto", className="text-left"
                        ),
                    dbc.Col(
                        f'#{line}', style={"fontWeight": "bold", "fontSize": "1.2em"}, width="auto",
                        className="text-right"
                        ),
                ],
                className="d-flex justify-content-between"
            )

            card_body_children = []

            if row['DealTitle'] is not None:
                card_body_children.append(
                    dbc.Row(
                        dbc.Col(
                            html.P(row['DealTitle'], className="text-muted", style={"fontStyle": "italic"}),
                            className="mb-2"
                            )
                    )
                )

            if row['ClientName'] is not None:
                card_body_children.append(
                    dbc.Row(
                        dbc.Col(html.P(row['ClientName']), className="mb-2")
                    )
                )

            card_body_children.append(
                dbc.Row(
                    dbc.Col(
                        dcc.Markdown(row['Subject'], dangerously_allow_html=True), className="mb-2", style={
                            "border": "1px solid #e0e0e0",
                            "padding": "10px",
                            "borderRadius": "5px"
                        }
                        )
                )
            )

            layout = dbc.Col(
                dbc.Card(
                    [
                        dbc.CardHeader(card_header),
                        dbc.CardBody(card_body_children)
                    ],
                    color=color,
                    inverse=True,
                    className="mb-3",
                    style={
                        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)",
                        "borderRadius": "10px"
                    }
                )
            )

            rows.append(layout)

        return clicked_date, html.Div(rows)
    return None, "Select a date in the calendar"


@callback(
    Output({"type": "cell", "date": ALL}, "style"),
    [Input("selected-date-store", "data")],
    [Input({"type": "cell", "date": ALL}, "n_clicks")]
)
def update_selected_cell_style(selected_date, n_clicks_list):
    styles = []

    for i, cell_id in enumerate(ctx.inputs_list[1]):
        date = cell_id['id']['date']
        today = datetime.today().date()
        cell_style = {
            "text-align": "left", "font-size": "0.8em", "padding": "5px",
            "width": "100px", "height": "65px",
            "cursor": "pointer"
        }
        if selected_date == date:
            cell_style.update(
                {
                    "background-color": "yellow",
                    "color": "black"
                }
            )
        elif date == today:
            cell_style.update({"background-color": "var(--bs-primary)", "color": "white"})

        styles.append(cell_style)
    return styles
