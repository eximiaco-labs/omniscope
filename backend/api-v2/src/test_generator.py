from timesheet.models import Timesheet
from core.generator import generate_schema, get_field_type, get_inner_type
from typing import get_type_hints

# Debug type information
timesheet = Timesheet
print("\nType hints:")
for field_name, field_type in get_type_hints(timesheet).items():
    print(f"\nField: {field_name}")
    print(f"Original type: {field_type}")
    print(f"Field type: {get_field_type(field_type)}")
    print(f"Inner type: {get_inner_type(field_type)}")
    print(f"Has origin: {hasattr(field_type, '__origin__')}")
    if hasattr(field_type, "__origin__"):
        print(f"Origin: {field_type.__origin__}")
        print(f"Args: {field_type.__args__}")

schema = generate_schema([Timesheet], None, include_base_types=False)
print("\nGenerated Schema:")
print(schema) 