from typing import Type, List, Optional, Union
from pydantic import BaseModel
from datetime import datetime
import re

def pluralize(name: str) -> str:
    """
    Pluralize a camelCase name considering compound words.
    Example: consultantOrEngineer -> consultantsOrEngineers
    """
    # Split on 'Or' and 'And' to handle each part separately
    parts = re.split(r'(Or|And)', name)
    
    # Pluralize each word part (not the connectors)
    for i in range(0, len(parts), 2):
        word = parts[i]
        if word:  # Skip empty strings
            # Basic English pluralization rules
            if word.endswith('y'):
                parts[i] = word[:-1] + 'ies'
            elif word.endswith(('s', 'sh', 'ch', 'x', 'z')):
                parts[i] = word + 'es'
            else:
                parts[i] = word + 's'
    
    return ''.join(parts)

def to_camel_case(snake_str: str) -> str:
    """Convert a string from snake_case to camelCase."""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def get_identifier_fields(cls: Type[BaseModel]) -> List[str]:
    """Get all fields marked as identifiers"""
    return [
        field_name
        for field_name, field in cls.model_fields.items()
        if field.json_schema_extra and field.json_schema_extra.get("is_identifier")
    ]

def generate_enum_type(enum_cls) -> str:
    """Generate GraphQL enum type from Python enum"""
    values = [f"    {name}" for name in enum_cls.__members__]
    return f"""enum {enum_cls.__name__} {{
{chr(10).join(values)}
}}"""

def generate_input_type(cls: Type[BaseModel], suffix: str = "Input") -> str:
    """Generate GraphQL input type from Pydantic model"""
    field_definitions = []
    for field_name, field in cls.model_fields.items():
        field_type = field.annotation
        gql_type = "String"
        
        if field_type == str:
            gql_type = "String"
        elif field_type == int:
            gql_type = "Int"
        elif field_type == float:
            gql_type = "Float"
        elif field_type == bool:
            gql_type = "Boolean"
        elif hasattr(field_type, "__origin__") and field_type.__origin__ == list:
            inner_type = field_type.__args__[0].__name__
            gql_type = f"[{inner_type}{suffix}]"
        elif isinstance(field_type, type) and issubclass(field_type, BaseModel):
            gql_type = f"{field_type.__name__}{suffix}"
            
        if field.default is not None:
            field_definitions.append(f"    {field_name}: {gql_type}")
        else:
            field_definitions.append(f"    {field_name}: {gql_type}!")
            
    return f"""input {cls.__name__}{suffix} {{
{chr(10).join(field_definitions)}
}}"""

def get_field_type(field_type):
    """Helper function to get the actual type from a potentially wrapped type (Optional, List, etc)"""
    if hasattr(field_type, "__origin__"):
        origin = field_type.__origin__
        if origin in (Optional, Union):
            # Get the first non-None type
            for arg in field_type.__args__:
                if arg != type(None):  # noqa
                    return get_field_type(arg)
        if origin in (list, List):
            return list
        if origin == dict:
            return dict
        return origin
    return field_type

def get_inner_type(field_type):
    """Helper function to get the actual inner type, handling Optional, List, Dict etc"""
    if hasattr(field_type, "__origin__"):
        origin = field_type.__origin__
        if origin in (Optional, Union):
            # Get the first non-None type
            for arg in field_type.__args__:
                if arg != type(None):  # noqa
                    return get_inner_type(arg)
        if origin in (list, List):
            inner = field_type.__args__[0]
            if hasattr(inner, "__origin__"):
                return get_inner_type(inner)
            return inner
        if origin == dict:
            value_type = field_type.__args__[1]
            if hasattr(value_type, "__origin__"):
                return get_inner_type(value_type)
            return value_type
    return field_type

def get_type_name(type_obj):
    """Helper function to get the type name, handling ForwardRef"""
    if hasattr(type_obj, "__name__"):
        # Map Python types to GraphQL types
        type_map = {
            "str": "String",
            "Any": "JSON",  # Using JSON for Any type
            "dict": "JSON",
            "Dict": "JSON",
            "list": "JSON",
            "List": "JSON"
        }
        name = type_obj.__name__
        return type_map.get(name, name)
    if hasattr(type_obj, "__forward_arg__"):
        # Map forward references
        type_map = {
            "str": "String",
            "Any": "JSON",
            "dict": "JSON",
            "Dict": "JSON",
            "list": "JSON",
            "List": "JSON"
        }
        name = type_obj.__forward_arg__
        return type_map.get(name, name)
    return "JSON"  # Fallback to JSON for unknown types

def generate_type(cls: Type[BaseModel], generated_types: set[str] = None) -> str:
    """Generate GraphQL type definition from a Pydantic model"""
    if generated_types is None:
        generated_types = set()
        
    if cls.__name__ in generated_types:
        return ""
        
    generated_types.add(cls.__name__)
    field_definitions = []
    type_definitions = []
    
    # Generate the base type first
    type_def = f"""type {cls.__name__} {{
{chr(10).join(field_definitions)}
}}"""
    
    # Generate collection type immediately after the base type
    collection_type = generate_collection_type(cls)
    type_definitions.append(collection_type)
    generated_types.add(f"{cls.__name__}Collection")
    
    for field_name, field in cls.model_fields.items():
        field_type = field.annotation
        is_optional = field.default is None and getattr(field_type, "__origin__", None) is Optional
        
        # Get the actual type and inner type
        actual_type = get_field_type(field_type)
        inner_type = get_inner_type(field_type)
        
        # Initialize type variables
        is_list = actual_type == list
        is_dict = actual_type == dict
        gql_type = None
        
        # Convert field name to camelCase
        camel_field_name = to_camel_case(field_name)
        
        # Determine GraphQL type
        if is_dict:
            if isinstance(inner_type, type) and issubclass(inner_type, BaseModel):
                nested_type = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                gql_type = f"{inner_type.__name__}Collection"
                field_definitions.append(f"    {camel_field_name}(filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                continue
            else:
                gql_type = f"[{get_type_name(inner_type)}]"
        elif is_list:
            if isinstance(inner_type, type) and issubclass(inner_type, BaseModel):
                nested_type = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                gql_type = f"{inner_type.__name__}Collection"
                field_definitions.append(f"    {camel_field_name}(filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                continue
            else:
                gql_type = f"[{get_type_name(inner_type)}]"
        elif isinstance(inner_type, type):
            if issubclass(inner_type, BaseModel):
                nested_type = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                gql_type = get_type_name(inner_type)
            elif inner_type == str:
                gql_type = "String"
            elif inner_type == int:
                gql_type = "Int"
            elif inner_type == float:
                gql_type = "Float"
            elif inner_type == bool:
                gql_type = "Boolean"
            elif inner_type == datetime:
                gql_type = "DateTime"
            elif field_name == "id":
                gql_type = "ID"
            elif hasattr(inner_type, "__name__"):
                gql_type = get_type_name(inner_type)
        
        if gql_type is None:
            gql_type = "String"  # Fallback type
            
        field_definitions.append(f"    {camel_field_name}: {gql_type}{'!' if not is_optional else ''}")
    
    # Update the type definition with the field definitions
    type_def = f"""type {cls.__name__} {{
{chr(10).join(field_definitions)}
}}"""
    
    if type_definitions:
        return "\n\n".join([type_def] + type_definitions)
    return type_def

def generate_collection_type(cls: Type[BaseModel]) -> str:
    """Generate GraphQL collection type for a model"""
    return f"""type {cls.__name__}Collection {{
    data: [{cls.__name__}!]!
    metadata: CollectionMetadata!
}}"""

def generate_collection_metadata_type() -> str:
    return """type CollectionMetadata {
    total: Int!
    filtered: Int!
}"""

def generate_filter_types() -> str:
    return """input RangeFilterInput {
    min: Float
    max: Float
}

input FilterOperatorInput {
    eq: String
    neq: String
    gt: Float
    gte: Float
    lt: Float
    lte: Float
    contains: String
    range: RangeFilterInput
}

input FilterInput {
    and: [FilterInput!]
    or: [FilterInput!]
    not: FilterInput
    field: String
    value: FilterOperatorInput
}

input SortInput {
    field: String!
    order: SortOrder! = ASC
}

input PaginationInput {
    limit: Int! = 20
    offset: Int! = 0
}

enum SortOrder {
    ASC
    DESC
}"""

def generate_base_schema() -> str:
    """Generate the base schema types that should be defined only once"""
    type_definitions = []
    
    # Add scalar types
    type_definitions.append("scalar DateTime")
    type_definitions.append("scalar JSON")  # Add JSON scalar type
    
    # Add base collection types
    type_definitions.append(generate_collection_metadata_type())
    type_definitions.append(generate_filter_types())
    
    return "\n\n".join(type_definitions)

def generate_schema(types: list[Type[BaseModel]], context_name: str, include_base_types: bool = False) -> str:
    """Generate complete GraphQL schema from types"""
    type_definitions = []
    generated_types = set()
    
    # Add base types only if requested
    if include_base_types:
        type_definitions.append(generate_base_schema())
    
    # Add model types
    for cls in types:
        type_def = generate_type(cls, generated_types)
        if type_def:
            type_definitions.append(type_def)
    
    # Generate context type
    field_definitions = []
    for cls in types:
        # Get the base name in camelCase
        base_name = to_camel_case(cls.__name__[0].lower() + cls.__name__[1:])
        
        # Collection field - properly pluralized
        if context_name:
            collection_name = pluralize(base_name)
            collection_args = "(filter: FilterInput, sort: SortInput, pagination: PaginationInput)"
            field_definitions.append(f"    {collection_name}{collection_args}: {cls.__name__}Collection!")
        
        # Single item fields based on identifiers
        identifier_fields = get_identifier_fields(cls)
        if identifier_fields:
            args = ", ".join(f"{field}: String" for field in identifier_fields)
            field_definitions.append(f"    {base_name}({args}): {cls.__name__}")
    
    # Add context type
    if context_name:
        context_type = f"""type {context_name} {{
{chr(10).join(field_definitions)}
}}"""
        type_definitions.append(context_type)
    
        # Add query type extension
        query_type = f"""extend type Query {{
{context_name[0].lower() + context_name[1:]}: {context_name}!
}}"""
        type_definitions.append(query_type)
    
    else:
        query_type = f"""extend type Query {{
{chr(10).join(field_definitions)}
}}"""
        type_definitions.append(query_type)
    
    return "\n\n".join(type_definitions)