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
from marketing_and_sales.resolvers import marketing_and_sales_resolvers
from ontology.resolvers import ontology_resolvers

from team.schema import init as team_init
from engagements.schema import init as engagements_init
from ontology.schema import init as ontology_init
from timesheet.schema import init as timesheet_init
from marketing_and_sales.schema import init as marketing_and_sales_init
from financial.schema import init as financial_init

from core.generator import generate_base_schema, GlobalTypeRegistry, to_snake_case
from omni_shared.settings import auth_settings 
from omni_shared.settings import graphql_settings

app = Flask(__name__)
CORS(app)

def create_schema():
    # Initialize schemas
    def init():
        team_init()
        engagements_init()
        ontology_init()
        timesheet_init()
        marketing_and_sales_init()
        financial_init()
    
    init()

    # Initialize registry and add base schema
    registry = GlobalTypeRegistry()

    # Add base types and schemas to registry
    generate_base_schema()  # This will register base types in the registry

    # Base query resolver
    base_query = QueryType()

    # Register version field in the registry
    registry.register_type("Query", """extend type Query {
    version: String!
}""")

    @base_query.field("version")
    def resolve_version(*_):
        return "2.0.0"

    # Create resolver types list starting with base query
    resolver_types = [base_query] + team_resolvers + engagements_resolvers + marketing_and_sales_resolvers + ontology_resolvers + [timesheet_query]

    for field_path, resolver_fn in registry.resolvers.items():
        type_name, field_name = field_path.split(".")
        
        # Special handling for namespace types - they need to be registered in Query
        if type_name == type_name.title() and field_name == to_snake_case(type_name):
            base_query.set_field(field_name.lower(), resolver_fn)
            continue
            
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
    
    # Create executable schema
    return make_executable_schema(
        [sdl],
        resolver_types,
        snake_case_fallback_resolvers
    )

# Create schema
schema = create_schema()

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