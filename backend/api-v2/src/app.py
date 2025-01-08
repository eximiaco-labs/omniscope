import os
import sys
from pathlib import Path

# Add src directory to Python path
src_dir = Path(__file__).parent
sys.path.insert(0, str(src_dir))

from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import make_executable_schema, graphql_sync, snake_case_fallback_resolvers
from ariadne.explorer import ExplorerGraphiQL

from team.resolvers.team import query, team
from team.schema import schema as team_schema

from omni_shared.settings import auth_settings 
from omni_shared.settings import graphql_settings

app = Flask(__name__)
CORS(app)

# GraphQL setup
current_dir = os.path.dirname(os.path.abspath(__file__))
base_schema_path = os.path.join(current_dir, "schema.graphql")

with open(base_schema_path) as f:
    base_schema = f.read()

type_defs = [
    base_schema,
    team_schema
]

schema = make_executable_schema(
    type_defs,
    [query, team],
    snake_case_fallback_resolvers
)

# GraphQL endpoints
@app.route("/graphql", methods=["POST"])
def graphql_server():
    data = request.get_json()
    success, result = graphql_sync(
        schema,
        data,
        context_value=request,
        debug=app.debug
    )
    status_code = 200 if success else 400
    return jsonify(result), status_code

@app.route("/graphql", methods=["GET"])
def graphql_playground():
    return ExplorerGraphiQL().html(None), 200

if __name__ == '__main__':
    app.run(debug=True)