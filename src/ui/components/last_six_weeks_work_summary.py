from dash import html

from models.base.powerdataframe import PowerDataFrame
import ui.components.weekly_projected_vs_actual_graph as wpa
import ui.components.allocation.allocation_by_kind_diary as abkd
import ui.components.base.colors as colors
import ui.components.base.cards as c


def render(dataset: PowerDataFrame, dataset_slug: str):
    children = []

    if dataset_slug == 'timesheet-last-six-weeks':
        by_kind = dataset.filter_by('Kind', equals_to='Squad')
        if len(by_kind.data) > 0:
            summary_by = by_kind.get_weekly_summary('Client')
            bar_graph = wpa.render(summary_by, actual_color=colors.KIND_COLORS['Squad'])
            children.append(c.create_graph_card('Squads per Week', bar_graph))

        by_kind = dataset.filter_by('Kind', equals_to='Consulting')
        if len(by_kind.data) > 0:
            summary_by = by_kind.get_weekly_summary('Client')
            bar_graph = wpa.render(summary_by, actual_color=colors.KIND_COLORS['Consulting'])
            children.append(c.create_graph_card('Consulting per Week', bar_graph))

        by_kind = dataset.filter_by('Kind', equals_to='Internal')
        if len(by_kind.data) > 0:
            summary_by = by_kind.get_weekly_summary('Client')
            bar_graph = wpa.render(summary_by, actual_color=colors.KIND_COLORS['Internal'])
            children.append(c.create_graph_card('Internals per Week', bar_graph))

        children.append(abkd.render(dataset.data))

    return html.Div(children)

