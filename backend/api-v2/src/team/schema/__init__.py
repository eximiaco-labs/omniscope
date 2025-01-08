from ..models import AccountManager, Consultant, Engineer
from core.generator import generate_schema

types = [AccountManager, Consultant, Engineer]
schema = generate_schema(types, "Team")

__all__ = ['schema'] 