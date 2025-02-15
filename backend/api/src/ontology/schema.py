from .models import Class
from core.generator import generate_schema

def init():
    types = [Class]
    schema = generate_schema(types, "Ontology", include_base_types=False)
    return schema
