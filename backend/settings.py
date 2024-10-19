import os

from dotenv import load_dotenv

load_dotenv()

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