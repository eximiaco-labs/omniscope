from dash import html
import dash_bootstrap_components as dbc
import calendar
from datetime import datetime

from models.base.powerdataframe import SummarizablePowerDataFrame


def render(year, month, df: SummarizablePowerDataFrame):
    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(year, month)
    today = datetime.today().date()

    table_header = [
        html.Thead(html.Tr(
            [html.Th(day, className="bg-secondary", style={"text-align": "center", "padding": "10px"}) for day in
             ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]]
        ))
    ]

    def calculate_work(date):
        records = df.filter_by('Date', equals_to=date)
        work = records.data['TimeInHs'].sum()
        return work

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

            work = calculate_work(date.date())
            cell_style.update({
                "text-align": "left", "font-size": "0.8em", "padding": "5px",
                "width": "100px", "height": "65px"
            })

            if date.date() == today:
                cell_style.update({"background-color": "var(--bs-primary)", "color": "white"})

            cell = html.Td(
                html.Div([
                    html.Div([html.Small(day)], style={"text-align": "left", "font-size": "0.8em"}),
                    html.Div(
                        html.P(work, style={"font-size": "1.2em", "font-weight": "bold"}) if work > 0 else html.P(""),
                        style={"text-align": "center", "margin-top": "10px"}),
                ], style={"height": "50px"})
                , style=cell_style)
            row.append(cell)

        table_rows.append(html.Tr(row))


    table_body = [html.Tbody(table_rows)]

    table = dbc.Table(table_header + table_body, bordered=True, hover=True, responsive=True, className="calendar-table")
    return html.Div([
        table
    ])
