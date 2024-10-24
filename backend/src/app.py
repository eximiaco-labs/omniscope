from flask import Flask, request, jsonify
from flask_cors import CORS
from ariadne import load_schema_from_path, make_executable_schema, graphql_sync, snake_case_fallback_resolvers
from ariadne.explorer import ExplorerGraphiQL

from google.oauth2 import id_token
from google.auth.transport import requests
from functools import wraps
from settings import auth_settings  # Import your auth settings

from api.queries import query
from api.mutations import mutation
import logging
import argparse
import sys
from api.execution_stats import ExecutionStatsExtension
import globals

def verify_token(token):
    try:
        # Use the client_id from your settings
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), auth_settings["client_id"])
        print(idinfo, file=sys.stderr)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        # ID token is valid. Get the user's Google Account ID from the decoded token.
        userid = idinfo['sub']
        return userid
    except ValueError as e:
        # Invalid token
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ', 1)[1]
            else:
                token = None
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(*args, **kwargs)
    return decorated

app = Flask(__name__)
CORS(app)

type_defs = load_schema_from_path("src/api/schema.graphql")
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
@token_required
def graphql_server():
    data = request.get_json()
    success, result = graphql_sync(
        schema,
        data,
        context_value=request,
        debug=app.debug,
        extensions=[ExecutionStatsExtension]
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
    app.run(debug=args.verbose,host="0.0.0.0")

