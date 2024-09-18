import pandas as pd
import ui.components.base.cards as c
from dash import html
import dash_bootstrap_components as dbc
import ui.components.base.colors as colors

def render(data: pd.DataFrame):
    # Extraindo os primeiros 5 caracteres da coluna 'Week' (dd/mm)
    data['WeekStart'] = data['Week'].str[:5]

    has_consulting = data[data['Kind'] == 'Consulting']['TimeInHs'].sum() > 0
    has_squad = data[data['Kind'] == 'Squad']['TimeInHs'].sum() > 0
    has_internal = data[data['Kind'] == 'Internal']['TimeInHs'].sum() > 0

    # Convertendo 'WeekStart' para datetime para garantir a ordenação correta
    data['WeekStartDate'] = pd.to_datetime(data['WeekStart'], format='%d/%m', errors='coerce')

    # Pivoteia a tabela para que os dias da semana e tipos (Kind) fiquem como colunas
    pivot_table = data.pivot_table(
        index=['Week', 'WeekStartDate'],
        columns=['DayOfWeek', 'Kind'],
        values='TimeInHs',
        aggfunc='sum',
        fill_value=0
    ).round(1)  # Limita a uma casa decimal

    # Ordena as colunas no padrão dos dias da semana
    ordered_columns = [
        ('Sunday', 'Squad'), ('Sunday', 'Consulting'), ('Sunday', 'Internal'),
        ('Monday', 'Squad'), ('Monday', 'Consulting'), ('Monday', 'Internal'),
        ('Tuesday', 'Squad'), ('Tuesday', 'Consulting'), ('Tuesday', 'Internal'),
        ('Wednesday', 'Squad'), ('Wednesday', 'Consulting'), ('Wednesday', 'Internal'),
        ('Thursday', 'Squad'), ('Thursday', 'Consulting'), ('Thursday', 'Internal'),
        ('Friday', 'Squad'), ('Friday', 'Consulting'), ('Friday', 'Internal'),
        ('Saturday', 'Squad'), ('Saturday', 'Consulting'), ('Saturday', 'Internal')
    ]

    kinds = []
    num_cols = 0

    if not has_consulting:
        ordered_columns = [
            (day, activity)
            for day, activity in ordered_columns
            if activity != 'Consulting'
        ]
    else:
        kinds.append('Consulting')
        num_cols = num_cols + 1

    if not has_squad:
        ordered_columns = [
            (day, activity)
            for day, activity in ordered_columns
            if activity != 'Squad'
        ]
    else:
        kinds.append('Squad')
        num_cols = num_cols + 1

    if not has_internal:
        ordered_columns = [
            (day, activity)
            for day, activity in ordered_columns
            if activity != 'Internal'
        ]
    else:
        kinds.append('Internal')
        num_cols = num_cols + 1

    # Reindexa as colunas na ordem desejada
    pivot_table = pivot_table.reindex(columns=ordered_columns, fill_value=0)

    # Ordena o DataFrame pela coluna 'WeekStartDate'
    pivot_table = pivot_table.sort_index(level='WeekStartDate')

    # Mapeia os nomes curtos "S", "C", "I" para os tipos de trabalho
    kind_map = {'Squad': 'S', 'Consulting': 'C', 'Internal': 'I'}

    # Cores de fundo alternadas
    bg_colors = ["#222222", "secondary"]  # Cor de fundo alternada

    # Cabeçalho da primeira linha (dias da semana)
    day_headers = []
    for i, day in enumerate(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']):
        bg_color = {'background-color': bg_colors[i % 2]}
        day_headers.append(html.Th(day, colSpan=num_cols, className="text-center", style=bg_color))

    # Cabeçalho da segunda linha (S, C, I) com cores e alternância de fundo
    sub_headers = []
    for i, day in enumerate(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']):
        bg_color = {'background-color': bg_colors[i % 2]}
        for kind in kinds:
            sub_headers.append(html.Th(kind_map[kind], style={**{'color': colors.KIND_COLORS[kind]}, **bg_color}, className=f"numeric-cell-{num_cols}"))

    table_header = [
        html.Thead(html.Tr([html.Th("Week")] + day_headers)),
        html.Thead(html.Tr([html.Th("")] + sub_headers)),
    ]

    # Corpo da tabela com as células numéricas aplicando a classe "numeric-cell"
    table_body = [
        html.Tbody([
            html.Tr([
                html.Td(week)  # Exibe o valor original de 'Week'
            ] + [
                html.Td(pivot_table.loc[(week, week_date), col], className=f"numeric-cell-{num_cols}", style={'color': colors.KIND_COLORS[col[1]], 'background-color': bg_colors[i // num_cols % 2]})
                for i, col in enumerate(ordered_columns)
            ]) for week, week_date in pivot_table.index
        ])
    ]

    # Tabela HTML com largura das colunas numéricas uniformizada
    return c.create_card(
        'Last weeks summary',
        dbc.Table(table_header + table_body, bordered=True, striped=True, hover=True, className="fixed-width-table")
    )

