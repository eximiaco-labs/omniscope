import dash_bootstrap_components as dbc
from dash import dcc, html


# PLOTLY_LOGO = "https://images.plot.ly/logo/new-branding/plotly-logomark.png"
#
# app = dash.Dash(
#     external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME]
# )

def render():

    areas_of_interest = [
        ("Week Review", "fas fa-calendar-check", "/"),
        ("Datasets", "fas fa-database", "/datasets"),
        ("Side-by-side", "fas fa-columns", "/side-by-side"),
        # ("Sales Funnel B2B", "fas fa-chart-line", "/sales-funnel-b2b"),
        ("Late Timesheet Entries", "fas fa-clock", "/lte"),
        # ("Ontology Publications", "fas fa-book", "/ontology-publications"),
        # ("Insights Publications", "fas fa-lightbulb", "/insights-publications"),
    ]

    about_us = [
        ("Consultants & Engineers", "fas fa-user-tie", "/consultants"),
        ("Account Managers", "fas fa-briefcase", "/account-managers"),
        ("Clients", "fas fa-users", "/clients"),
        ("Sponsors", "fas fa-handshake", "/sponsors"),
        ("Products and Services", "fas fa-box", "/products-or-services"),
        ("Cases", "fas fa-folder-open", "/cases"),
        ("Projects", "fas fa-project-diagram", "/projects"),
    ]

    administrative = [
        ("Inconsistency Finder", "fas fa-search", "/inconsistency-finder"),
        ("Refresh data", "fas fa-sync-alt", "/hit-refresh"),
    ]

    # all = areas_of_interest + about_us + administrative

    nav_1 = dbc.Nav(
        [
            dbc.NavLink(
                [html.I(className=f"{element[1]} me-2"), html.Span(element[0])],
                href=element[2],
                active="exact",
            )
            for element in areas_of_interest
        ],
        vertical=True,
        pills=True,
    )

    nav_2 = dbc.Nav(
        [
            dbc.NavLink(
                [html.I(className=f"{element[1]} me-2"), html.Span(element[0])],
                href=element[2],
                active="exact",
            )
            for element in about_us
        ],
        vertical=True,
        pills=True,
    )

    nav_3 = dbc.Nav(
        [
            dbc.NavLink(
                [html.I(className=f"{element[1]} me-2"), html.Span(element[0])],
                href=element[2],
                active="exact",
            )
            for element in administrative
        ],
        vertical=True,
        pills=True,
    )

    sidebar = html.Div(
        [
            nav_1,
            html.Hr(),
            nav_2,
            html.Hr(),
            nav_3,
        ],
        className="sidebar",
    )

    return sidebar
