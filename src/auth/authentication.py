import os

import globals

from dash_auth import OIDCAuth

from settings import auth_settings
from werkzeug.middleware.proxy_fix import ProxyFix


def run():
    if auth_settings["behind_proxy"]:
        globals.app.server.wsgi_app = ProxyFix(
            globals.app.server.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
        )

    globals.auth = OIDCAuth(globals.app, secret_key=auth_settings["secret_key"])
    globals.auth.register_provider(
        "google",
        token_endpoint_auth_method="client_secret_post",
        client_id=auth_settings["client_id"],
        client_secret=auth_settings["client_secret"],
        server_metadata_url=auth_settings["metadata_url"]
    )
