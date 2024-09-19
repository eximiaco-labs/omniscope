import dash
from dash import html, dcc, Input, Output, State, callback, ALL
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta
from models.helpers.weeks import Weeks
import calendar
import json


def generate_calendar(selected_date):
    year, month = selected_date.year, selected_date.month
    cal = calendar.monthcalendar(year, month)

    # Adjust calendar to start on Sunday
    first_day_weekday = calendar.weekday(year, month, 1)
    days_from_previous_month = first_day_weekday + 1 if first_day_weekday != 6 else 0

    if month == 1:
        prev_month, prev_year = 12, year - 1
    else:
        prev_month, prev_year = month - 1, year
    _, last_day_prev_month = calendar.monthrange(prev_year, prev_month)

    header = [html.Th(day, className="text-center p-1", style={"width": "2rem", "height": "1.5rem"}) for day in
              "SMTWTFS"]

    rows = []
    day_count = 1
    for week in range(6):  # Maximum of 6 weeks in a month
        row = []
        for weekday in range(7):  # 7 days in a week
            if week == 0 and weekday < days_from_previous_month:
                # Days from the previous month
                day = last_day_prev_month - days_from_previous_month + weekday + 1
                adj_date = datetime(prev_year, prev_month, day)
                class_name = "text-muted"
            elif day_count > calendar.monthrange(year, month)[1]:
                # Days from the next month
                day = day_count - calendar.monthrange(year, month)[1]
                if month == 12:
                    next_month, next_year = 1, year + 1
                else:
                    next_month, next_year = month + 1, year
                adj_date = datetime(next_year, next_month, day)
                class_name = "text-muted"
                day_count += 1
            else:
                # Days from the current month
                adj_date = datetime(year, month, day_count)
                class_name = ""
                day_count += 1

            start, end = Weeks.get_week_dates(selected_date)
            is_selected = (adj_date.date() == selected_date.date())
            is_selected_week = start <= adj_date <= end


            cell_classes = f"d-flex align-items-center justify-content-center p-1 {class_name}"
            cell_style = {
                "cursor": "pointer",
                "width": "2.2rem",
                "height": "2rem"
            }

            if is_selected:
                cell_style["background-color"] = "#2a9fd6"
                cell_style["color"] = "white"
            elif is_selected_week:
                cell_style["color"] = "#2a9fd6"
                cell_classes += " bg-light"

            cell_content = html.Div(
                adj_date.day,
                className=cell_classes,
                style=cell_style,
                id={"type": "calendar-day", "date": adj_date.strftime("%Y-%m-%d")},
            )
            row.append(html.Td(cell_content, className="p-0"))
        rows.append(html.Tr(row))
        if day_count > calendar.monthrange(year, month)[1] and weekday == 6:
            break  # Stop if we've filled out all the days and completed the week

    return html.Table([html.Thead(html.Tr(header)), html.Tbody(rows)], className="table table-bordered table-sm")

def generate_calendar_old(selected_date):
    year, month = selected_date.year, selected_date.month
    cal = calendar.monthcalendar(year, month)

    if month == 1:
        prev_month, prev_year = 12, year - 1
    else:
        prev_month, prev_year = month - 1, year
    _, last_day_prev_month = calendar.monthrange(prev_year, prev_month)

    first_weekday, _ = calendar.monthrange(year, month)

    header = [html.Th(day[0], className="text-center p-1", style={"width": "2rem", "height": "1.5rem"}) for day in
              "SMTWTFS"]

    rows = []
    prev_month_day = last_day_prev_month - first_weekday + 1
    next_month_day = 1

    for week in cal:
        row = []
        for day in week:
            if day == 0:
                if prev_month_day <= last_day_prev_month:
                    adj_date = datetime(prev_year, prev_month, prev_month_day)
                    prev_month_day += 1
                else:
                    if month == 12:
                        next_month, next_year = 1, year + 1
                    else:
                        next_month, next_year = month + 1, year
                    adj_date = datetime(next_year, next_month, next_month_day)
                    next_month_day += 1
                class_name = "text-muted"
            else:
                adj_date = datetime(year, month, day)
                class_name = ""

            is_selected = (adj_date.date() == selected_date.date())
            is_selected_week = (adj_date.isocalendar()[1] == selected_date.isocalendar()[1])

            cell_classes = f"d-flex align-items-center justify-content-center p-1 {class_name}"
            cell_style = {
                "cursor": "pointer",
                "width": "2.3rem",
                "height": "2rem"
            }

            if is_selected:
                cell_style["background-color"] = "#2a9fd6"
                cell_style["color"] = "white"
            elif is_selected_week:
                cell_style["color"] = "#2a9fd6"
                cell_classes += " bg-light"

            cell_content = html.Div(
                adj_date.day,
                className=cell_classes,
                style=cell_style,
                id={"type": "calendar-day", "date": adj_date.strftime("%Y-%m-%d")},
            )
            row.append(html.Td(cell_content, className="p-0"))
        rows.append(html.Tr(row))

    return html.Table([html.Thead(html.Tr(header)), html.Tbody(rows)], className="table table-bordered table-sm")


def render(selected_date):
    return html.Div(
        [
            dcc.Store(id="selected-date-store", data=selected_date.strftime("%Y-%m-%d")),
            dbc.Row(
                [
                    dbc.Col(
                        dbc.Button(
                            html.I(className="fas fa-chevron-left"), id="prev-month", n_clicks=0, color="link",
                            size="sm"
                        ),
                        width="auto",
                    ),
                    dbc.Col(html.H6(id="month-year-display", className="text-center mb-0"), width="auto"),
                    dbc.Col(
                        dbc.Button(
                            html.I(className="fas fa-chevron-right"), id="next-month", n_clicks=0, color="link",
                            size="sm"
                        ),
                        width="auto",
                    ),
                ], className="mb-2 d-flex justify-content-between align-items-center"
            ),
            html.Div(id="calendar-container"),
            html.Div(id="selected-date-output", className="text-center mt-2 small")
        ], className="border rounded", style={"max-width": "300px"}
    )


@callback(
    Output("calendar-container", "children"),
    Output("month-year-display", "children"),
    Output("selected-date-store", "data"),
    Input("prev-month", "n_clicks"),
    Input("next-month", "n_clicks"),
    Input({"type": "calendar-day", "date": ALL}, "n_clicks"),
    Input("selected-date-store", "data"),
    State({"type": "calendar-day", "date": ALL}, "id"),
)
def update_calendar(prev_clicks, next_clicks, day_clicks, selected_date_str, day_ids):
    ctx = dash.callback_context
    selected_date = datetime.strptime(selected_date_str, "%Y-%m-%d")

    if not ctx.triggered:
        button_id = "initial"
    else:
        button_id = ctx.triggered[0]["prop_id"].split(".")[0]

    if button_id != "selected-date-store":
        if button_id == "prev-month":
            selected_date = (selected_date.replace(day=1) - timedelta(days=1)).replace(day=1)
        elif button_id == "next-month":
            selected_date = (selected_date.replace(day=1) + timedelta(days=32)).replace(day=1)
        elif "date" in button_id:
            clicked_date_str = json.loads(button_id)["date"]
            clicked_date = datetime.strptime(clicked_date_str, "%Y-%m-%d")
            selected_date = clicked_date

    calendar_output = generate_calendar(selected_date)
    month_year_display = selected_date.strftime("%b %Y")
    selected_date_str = selected_date.strftime("%Y-%m-%d")

    return calendar_output, month_year_display, selected_date_str
