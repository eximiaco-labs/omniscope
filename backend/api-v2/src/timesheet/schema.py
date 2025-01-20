from .models import Timesheet
from core.generator import generate_schema

def init():
    types = [Timesheet]
    schema = generate_schema(types, None, include_base_types=False)
    return schema
