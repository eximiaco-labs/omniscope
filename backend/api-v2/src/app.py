import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import make_executable_schema, graphql_sync, snake_case_fallback_resolvers, QueryType, ObjectType
from ariadne.explorer import ExplorerGraphiQL

from team.resolvers.team import (
    resolve_team,
    resolve_team_account_managers,
    resolve_team_consultants,
    resolve_team_engineers
)
from team.schema import schema as team_schema

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

# Query resolvers
query = QueryType()
query.set_field("team", resolve_team)

# Team resolvers
team = ObjectType("Team")
team.set_field("accountManagers", resolve_team_account_managers)
team.set_field("consultants", resolve_team_consultants)
team.set_field("engineers", resolve_team_engineers)

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