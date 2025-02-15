from .models import User
from core.generator import generate_schema


def init():
    types = [User]
    schema = generate_schema(types, "Admin", include_base_types=False)
    return schema
