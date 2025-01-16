import os
import sys
from pathlib import Path
from typing import Union, List, Dict, Callable, Tuple

# Add src directory to Python path
src_dir = Path(__file__).parent
sys.path.insert(0, str(src_dir))

from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import make_executable_schema, graphql_sync, snake_case_fallback_resolvers, QueryType, ObjectType
from ariadne.explorer import ExplorerGraphiQL

from team.resolvers import team_resolvers
from engagements.resolvers import engagements_resolvers
from timesheet.resolvers import query as timesheet_query
from ontology.resolvers.ontology import query as ontology_query, ontology

from team.schema import schema as team_schema
from engagements.schema import schema as engagements_schema
from ontology.schema import schema as ontology_schema
from timesheet.schema import schema as timesheet_schema

from core.generator import generate_base_schema, GlobalTypeRegistry

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

# Initialize registry and add base schema
registry = GlobalTypeRegistry()

# Add base types and schemas to registry
registry.register_type("Query", base_schema)
generate_base_schema()  # This will register base types in the registry

# Add module schemas to registry
team_sdl = team_schema[0] if isinstance(team_schema, tuple) else team_schema
engagements_sdl = engagements_schema[0] if isinstance(engagements_schema, tuple) else engagements_schema
ontology_sdl = ontology_schema[0] if isinstance(ontology_schema, tuple) else ontology_schema
timesheet_sdl, timesheet_resolvers = timesheet_schema

# Create resolver types list starting with base query
resolver_types = team_resolvers + engagements_resolvers + [ontology_query, ontology, timesheet_query]

for field_path, resolver_fn in registry.resolvers.items():
    type_name, field_name = field_path.split(".")
    # Get or create type object
    type_obj = next(
        (r for r in resolver_types if isinstance(r, ObjectType) and r.name == type_name),
        ObjectType(type_name)
    )
    # Set resolver
    if not type_obj._resolvers.get(field_name):
        type_obj.set_field(field_name, resolver_fn)
    
    if type_obj not in resolver_types:
        resolver_types.append(type_obj)

# Get all SDL from registry
sdl = registry.generate_sdl()
type_defs = [
    sdl,
]

# Create executable schema
schema = make_executable_schema(
    type_defs,
    resolver_types,
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