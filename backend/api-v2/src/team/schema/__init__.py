from ..models import AccountManager, ConsultantOrEngineer
from core.generator import generate_schema

types = [AccountManager, ConsultantOrEngineer]
schema = generate_schema(types, "Team")

__all__ = ['schema'] 