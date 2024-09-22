import dash
import ui.areas.datasets as datasets

dash.register_page(__name__, path_template="/datasets", title='Omniscope')


def layout(**kwargs):
    return datasets.render(**kwargs)
