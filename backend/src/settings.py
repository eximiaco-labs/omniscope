import os

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
if not os.getenv('FLASK_SECRET_KEY'):
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

auth_settings = {
    "secret_key": os.environ.get("FLASK_SECRET_KEY"),
    "client_id": os.environ.get("AUTH_CLIENT_ID"),
    "client_secret": os.environ.get("AUTH_CLIENT_SECRET"),
    "metadata_url": os.environ.get("AUTH_METADATA_URL"),
    "behind_proxy": os.environ.get("BEHIND_PROXY", False)
}

api_settings = {
    "everhour_api_key": os.environ.get("EVERHOUR_API_KEY"),
    "todoist_api_key": os.environ.get("TODOIST_API_KEY"),
    "pipedrive_api_key": os.environ.get("PIPEDRIVE_API_KEY"),
    "wordpress_user": os.environ.get("WORDPRESS_USER"),
    "wordpress_pass": os.environ.get("WORDPRESS_PASS")
}