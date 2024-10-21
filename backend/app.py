from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import load_schema_from_path, make_executable_schema, graphql_sync, snake_case_fallback_resolvers
from ariadne.explorer import ExplorerGraphiQL

from api.queries import query
from api.mutations import (mutation)
import logging
import argparse

import globals

app = Flask(__name__)
CORS(app)

type_defs = load_schema_from_path("./api/schema.graphql")
schema = make_executable_schema(
    type_defs, 
    query,
    snake_case_fallback_resolvers,
    mutation,
    convert_names_case=True
)

explorer_html = ExplorerGraphiQL().html(None)


@app.route("/graphql", methods=["GET"])
def graphql_playground():
    return explorer_html, 200


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


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-v', '--verbose', action='store_true', help='Enable verbose logging')
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
        app.logger.setLevel(logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)
        app.logger.setLevel(logging.INFO)

    app.logger.info("Starting the application")
    globals.update()
    app.run(debug=args.verbose)
