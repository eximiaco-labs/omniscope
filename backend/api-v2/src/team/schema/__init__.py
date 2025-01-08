from ..models import AccountManager, Consultant, Engineer
from .generator import generate_schema

types = [AccountManager, Consultant, Engineer]
schema = generate_schema(types)

__all__ = ['schema'] 