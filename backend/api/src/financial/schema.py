from .models import Financial
from core.generator import generate_schema


def init():
    types = [Financial]
    schema = generate_schema(types, None, include_base_types=False)
    return schema
