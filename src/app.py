from dash import Dash
import dash_bootstrap_components as dbc
from auth import authentication
import ui.layout
import globals
import flask
from flask import jsonify, render_template


server = flask.Flask(__name__, template_folder='ui/templates')
server.config.update(
    {
        "SESSION_TYPE": "filesystem",
    }
)

from dash_bootstrap_templates import load_figure_template

dbc_css = "https://cdn.jsdelivr.net/gh/AnnMarieW/dash-bootstrap-templates/dbc.min.css"
globals.template = "cyborg"
globals.app = Dash(
    server=server,
    title='Omniscope',
    external_stylesheets=[
        dbc.themes.CYBORG,
        "https://use.fontawesome.com/releases/v5.15.4/css/all.css",
        dbc_css,
    ],
    # suppress_callback_exceptions=True,
    use_pages=True,
    pages_folder='ui/pages'
)

load_figure_template('all')

authentication.run()
globals.update()
globals.app.layout = ui.layout.render()


@server.route('/api/status')
def api_status():
    return jsonify({"status": "OK"})


#server.add_url_rule('/api/status', 'api_status', api_status)

@server.route('/slides')
def presentation():

    with open('revealjs_example.md', 'r') as file:
        markdown_content = file.read()

    # Renderiza o template com os slides
    return render_template('reveal_template.html', title='Omniscope', slides=markdown_content)


if __name__ == "__main__":
    globals.app.run("0.0.0.0", 80)
