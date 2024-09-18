from dash import dcc, html
import dash_bootstrap_components as dbc

icon_style = {
    'color': 'var(--bs-light)',
    'text-align': 'center'
}

tile_style = {
    'background-color': 'var(--bs-dark)',
    'border': 'none',
    'border-radius': '10px',
    'box-shadow': '0 4px 8px 0 rgba(0,0,0,0.2)',
    'margin': '5px',
    'padding': '10px',
    'text-decoration': 'none',
    'transition': 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
    'cursor': 'pointer',
    'min-height': '150px'
}


def render(title, icon_class, link):
    return html.A(
        dbc.Card(
            dbc.CardBody(
                [
                    html.I(className=f"{icon_class} fa-3x", style=icon_style),
                    html.H6(
                        title, className="card-title",
                        style={'color': 'var(--bs-light)', 'margin-top': '10px', 'font-size': '14px'}
                    ),
                ],
                style=icon_style
            ),
            className='icon-card',
            style=tile_style
        ),
        href=link,
        style={'text-decoration': 'none'}
    )


def render_row(row):
    buttons = [
        dbc.Col(render(t, icon, link), xs=12, sm=6, md=4, lg=2, style={'min-width': '150px'})
        for t, icon, link in row
    ]

    return dbc.Row(buttons, justify="center")

