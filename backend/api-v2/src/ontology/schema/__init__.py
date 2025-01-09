from ..models import Class
from core.generator import generate_schema

types = [Class]
schema = generate_schema(types, "Ontology", include_base_types=False)

__all__ = ['schema'] 