from .models import AccountManager, ConsultantOrEngineer
from core.generator import generate_schema

def init():
    types = [AccountManager, ConsultantOrEngineer]
    schema = generate_schema(types, "Team", include_base_types=False)
    return schema
