from typing import Type, List
from pydantic import BaseModel
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

def generate_type(cls: Type[BaseModel]) -> str:
    """Generate GraphQL type definition from a Pydantic model"""
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
        elif field_name == "id":
            gql_type = "ID"
            
        field_definitions.append(f"    {field_name}: {gql_type}!")
        
    return f"""type {cls.__name__} {{
{chr(10).join(field_definitions)}
}}"""

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
    
    # Add base collection types
    type_definitions.append(generate_collection_metadata_type())
    type_definitions.append(generate_filter_types())
    
    return "\n\n".join(type_definitions)

def generate_schema(types: list[Type[BaseModel]], context_name: str, include_base_types: bool = False) -> str:
    """Generate complete GraphQL schema from types"""
    type_definitions = []
    
    # Add base types only if requested
    if include_base_types:
        type_definitions.append(generate_base_schema())
    
    # Add model types
    for cls in types:
        type_definitions.append(generate_type(cls))
        type_definitions.append(generate_collection_type(cls))
    
    # Generate context type
    field_definitions = []
    for cls in types:
        # Get the base name in camelCase
        base_name = to_camel_case(cls.__name__[0].lower() + cls.__name__[1:])
        
        # Collection field - properly pluralized
        collection_name = pluralize(base_name)
        collection_args = "(filter: FilterInput, sort: SortInput, pagination: PaginationInput)"
        field_definitions.append(f"    {collection_name}{collection_args}: {cls.__name__}Collection!")
        
        # Single item fields based on identifiers
        identifier_fields = get_identifier_fields(cls)
        if identifier_fields:
            args = ", ".join(f"{field}: String" for field in identifier_fields)
            field_definitions.append(f"    {base_name}({args}): {cls.__name__}")
    
    # Add context type
    context_type = f"""type {context_name} {{
{chr(10).join(field_definitions)}
}}"""
    type_definitions.append(context_type)
    
    # Add query type extension
    query_type = f"""extend type Query {{
    {context_name[0].lower() + context_name[1:]}: {context_name}!
}}"""
    type_definitions.append(query_type)
    
    return "\n\n".join(type_definitions) 