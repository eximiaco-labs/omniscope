import os
import sys
from pathlib import Path

# Add src directory to Python path
src_dir = Path(__file__).parent
sys.path.insert(0, str(src_dir))

from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import make_executable_schema, graphql_sync, snake_case_fallback_resolvers, QueryType
from ariadne.explorer import ExplorerGraphiQL

from team.resolvers.team import query as team_query, team
from team.schema import schema as team_schema
from ontology.resolvers.ontology import query as ontology_query, ontology
from ontology.schema import schema as ontology_schema
from timesheet.schema import schema as timesheet_schema

from core.generator import generate_base_schema

from omni_shared.settings import auth_settings 
from omni_shared.settings import graphql_settings

app = Flask(__name__)
CORS(app)

# GraphQL setup
current_dir = os.path.dirname(os.path.abspath(__file__))
base_schema_path = os.path.join(current_dir, "schema.graphql")

with open(base_schema_path) as f:
    base_schema = f.read()

# Base query resolver
base_query = QueryType()

@base_query.field("version")
def resolve_version(*_):
    return "2.0.0"

type_defs = [
    base_schema,
    generate_base_schema(),  # Include base types only once
    team_schema,
    ontology_schema,
    timesheet_schema
]

schema = make_executable_schema(
    type_defs,
    [base_query, team_query, team, ontology_query, ontology],
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