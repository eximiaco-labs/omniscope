from typing import Type, List, Optional, Union, Any, Dict, Callable
from pydantic import BaseModel
from datetime import datetime
import re

class GlobalTypeRegistry:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.types = {}
            cls._instance.query_fields = []
            cls._instance.type_parameters = {}  # Store query parameters for each type
        return cls._instance

    def register_type(self, type_name: str, type_def: str, parameters: List[str] = None):
        # Special handling for Query type
        if type_name == "Query":
            # Extract fields from the Query type extension
            field_lines = type_def.split("\n")[1:-1]  # Skip first and last lines
            self.query_fields.extend(line.strip() for line in field_lines if line.strip())
        else:
            self.types[type_name] = type_def
            if parameters:
                self.type_parameters[type_name] = parameters
    
    def is_registered(self, type_name: str) -> bool:
        return type_name in self.types

    def get_type_parameters(self, type_name: str) -> List[str]:
        return self.type_parameters.get(type_name, [])

    def get_all_types(self) -> Dict[str, str]:
        types = dict(self.types)
        if self.query_fields:
            query_type = """type Query {
%s
}""" % "\n".join(self.query_fields)
            types["Query"] = query_type
        return types

    def generate_sdl(self) -> str:
        return "\n\n".join(self.get_all_types().values())
    
    def clear(self):
        self.types = {}
        self.query_fields = []
        self.type_parameters = {}
        

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
    registry = GlobalTypeRegistry()
    if registry.is_registered(enum_cls.__name__):
        return ""
        
    values = [f"    {name}" for name in enum_cls.__members__]
    enum_type = f"""enum {enum_cls.__name__} {{
{chr(10).join(values)}
}}"""
    registry.register_type(enum_cls.__name__, enum_type)
    return enum_type

def generate_input_type(cls: Type[BaseModel], suffix: str = "Input") -> str:
    """Generate GraphQL input type from Pydantic model"""
    registry = GlobalTypeRegistry()
    type_name = f"{cls.__name__}{suffix}"
    
    if registry.is_registered(type_name):
        return ""
        
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
            
    input_type = f"""input {type_name} {{
{chr(10).join(field_definitions)}
}}"""
    registry.register_type(type_name, input_type)
    return input_type

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

def to_snake_case(name: str) -> str:
    """Convert a string from camelCase to snake_case"""
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

def generate_default_resolver(field_name: str) -> Callable:
    """Generate a default resolver for collection fields"""
    def resolver(obj: Any, info: Any, filter: Dict = None, sort: Dict = None, pagination: Dict = None) -> Dict[str, Any]:
        if isinstance(obj, dict):
            data = obj.get(field_name)
        else:
            data = getattr(obj, field_name, None)
        
        # If data is None or not a list, return empty collection
        if data is None:
            return {
                "data": [],
                "metadata": {
                    "total": 0,
                    "filtered": 0
                }
            }
            
        # Ensure data is a list
        if not isinstance(data, (list, tuple)):
            data = [data]
            
        total = len(data)
        filtered_data = list(data)  # Make a copy to not modify original
        
        # Apply filters if provided
        if filter and filter.get("field") and filter.get("value"):
            field = to_snake_case(filter["field"])  # Convert field to snake_case
            value = filter["value"]
            filtered_data = [
                item for item in filtered_data 
                if (isinstance(item, dict) and field in item and item[field] == value) or
                   (not isinstance(item, dict) and hasattr(item, field) and getattr(item, field) == value)
            ]
            
        # Apply sorting if provided
        if sort and sort.get("field"):
            reverse = sort.get("order", "ASC") == "DESC"
            field = to_snake_case(sort["field"])  # Convert field to snake_case
            filtered_data.sort(
                key=lambda x: x.get(field) if isinstance(x, dict) else getattr(x, field, None),
                reverse=reverse
            )
            
        # Apply pagination if provided
        if pagination:
            offset = pagination.get("offset", 0)
            limit = pagination.get("limit", 20)
            filtered_data = filtered_data[offset:offset + limit]
            
        return {
            "data": filtered_data,
            "metadata": {
                "total": total,
                "filtered": len(filtered_data)
            }
        }
    return resolver

def generate_type(cls: Type[BaseModel], generated_types: set[str] = None) -> tuple[str, Dict[str, Callable]]:
    """Generate GraphQL type definition from a Pydantic model and its resolvers"""
    registry = GlobalTypeRegistry()
    
    if registry.is_registered(cls.__name__):
        return "", {}
        
    if generated_types is None:
        generated_types = set()
        
    if cls.__name__ in generated_types:
        return "", {}
        
    generated_types.add(cls.__name__)
    field_definitions = []
    type_definitions = []
    resolvers = {}
    
    # Collect parameters from identifier fields
    parameters = get_identifier_fields(cls)
    
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
                nested_type, nested_resolvers = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
                gql_type = f"{inner_type.__name__}Collection"
                
                # Get parameters for the inner type
                inner_params = registry.get_type_parameters(inner_type.__name__)
                param_args = ", ".join(f"{param}: String" for param in inner_params) if inner_params else ""
                param_str = f"({param_args}, " if param_args else "("
                
                field_definitions.append(f"    {camel_field_name}{param_str}filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                # Generate resolver for discovered nested types
                resolvers[f"{cls.__name__}.{camel_field_name}"] = generate_default_resolver(field_name)
                continue
            else:
                gql_type = f"[{get_type_name(inner_type)}]"
        elif is_list:
            if isinstance(inner_type, type) and issubclass(inner_type, BaseModel):
                nested_type, nested_resolvers = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
                gql_type = f"{inner_type.__name__}Collection"
                
                # Get parameters for the inner type
                inner_params = registry.get_type_parameters(inner_type.__name__)
                param_args = ", ".join(f"{param}: String" for param in inner_params) if inner_params else ""
                param_str = f"({param_args}, " if param_args else "("
                
                field_definitions.append(f"    {camel_field_name}{param_str}filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                # Generate resolver for discovered nested types
                resolvers[f"{cls.__name__}.{camel_field_name}"] = generate_default_resolver(field_name)
                continue
            else:
                gql_type = f"[{get_type_name(inner_type)}]"
        elif isinstance(inner_type, type):
            if issubclass(inner_type, BaseModel):
                nested_type, nested_resolvers = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
                gql_type = get_type_name(inner_type)
                
                # Get parameters for the inner type
                inner_params = registry.get_type_parameters(inner_type.__name__)
                if inner_params:
                    param_args = ", ".join(f"{param}: String" for param in inner_params)
                    field_definitions.append(f"    {camel_field_name}({param_args}): {gql_type}{'!' if not is_optional else ''}")
                    continue
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

    # Register the type with its parameters
    registry.register_type(cls.__name__, type_def, parameters)
    
    if type_definitions:
        return "\n\n".join([type_def] + type_definitions), resolvers
    return type_def, resolvers

def generate_collection_type(cls: Type[BaseModel]) -> str:
    """Generate GraphQL collection type for a model"""
    registry = GlobalTypeRegistry()
    type_name = f"{cls.__name__}Collection"
    
    if registry.is_registered(type_name):
        return ""
        
    collection_type = f"""type {type_name} {{
    data: [{cls.__name__}!]!
    metadata: CollectionMetadata!
}}"""
    registry.register_type(type_name, collection_type)
    return collection_type

def generate_collection_metadata_type() -> str:
    registry = GlobalTypeRegistry()
    if registry.is_registered("CollectionMetadata"):
        return ""
        
    metadata_type = """type CollectionMetadata {
    total: Int!
    filtered: Int!
}"""
    registry.register_type("CollectionMetadata", metadata_type)
    return metadata_type

def generate_filter_types() -> str:
    registry = GlobalTypeRegistry()
    type_definitions = []
    
    if not registry.is_registered("RangeFilterInput"):
        range_filter = """input RangeFilterInput {
    min: Float
    max: Float
}"""
        registry.register_type("RangeFilterInput", range_filter)
        type_definitions.append(range_filter)

    if not registry.is_registered("FilterOperatorInput"):
        filter_operator = """input FilterOperatorInput {
    eq: String
    neq: String
    gt: Float
    gte: Float
    lt: Float
    lte: Float
    contains: String
    range: RangeFilterInput
}"""
        registry.register_type("FilterOperatorInput", filter_operator)
        type_definitions.append(filter_operator)

    if not registry.is_registered("FilterInput"):
        filter_input = """input FilterInput {
    and: [FilterInput!]
    or: [FilterInput!]
    not: FilterInput
    field: String
    value: FilterOperatorInput
}"""
        registry.register_type("FilterInput", filter_input)
        type_definitions.append(filter_input)

    if not registry.is_registered("SortInput"):
        sort_input = """input SortInput {
    field: String!
    order: SortOrder! = ASC
}"""
        registry.register_type("SortInput", sort_input)
        type_definitions.append(sort_input)

    if not registry.is_registered("PaginationInput"):
        pagination_input = """input PaginationInput {
    limit: Int! = 20
    offset: Int! = 0
}"""
        registry.register_type("PaginationInput", pagination_input)
        type_definitions.append(pagination_input)

    if not registry.is_registered("SortOrder"):
        sort_order = """enum SortOrder {
    ASC
    DESC
}"""
        registry.register_type("SortOrder", sort_order)
        type_definitions.append(sort_order)

    return "\n\n".join(type_definitions) if type_definitions else ""

def generate_base_schema() -> str:
    """Generate the base schema types that should be defined only once"""
    registry = GlobalTypeRegistry()
    type_definitions = []
    
    # Add scalar types
    if not registry.is_registered("DateTime"):
        scalar_datetime = "scalar DateTime"
        registry.register_type("DateTime", scalar_datetime)
        type_definitions.append(scalar_datetime)

    if not registry.is_registered("JSON"):
        scalar_json = "scalar JSON"
        registry.register_type("JSON", scalar_json)
        type_definitions.append(scalar_json)
    
    # Add base collection types
    metadata_type = generate_collection_metadata_type()
    if metadata_type:
        type_definitions.append(metadata_type)
        
    filter_types = generate_filter_types()
    if filter_types:
        type_definitions.append(filter_types)
    
    return "\n\n".join(type_definitions) if type_definitions else ""

def generate_schema(types: list[Type[BaseModel]], context_name: str, include_base_types: bool = False) -> tuple[str, Dict[str, Callable]]:
    """Generate complete GraphQL schema from types and their resolvers"""
    type_definitions = []
    generated_types = set()
    all_resolvers = {}
    
    # Add base types only if requested
    if include_base_types:
        base_schema = generate_base_schema()
        if base_schema:
            type_definitions.append(base_schema)
    
    # Add model types
    for cls in types:
        type_def, resolvers = generate_type(cls, generated_types)
        if type_def:
            type_definitions.append(type_def)
            all_resolvers.update(resolvers)
    
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
            # Do not generate resolver for root types
            # They should be handled by the context resolver
        
        # Single item fields based on identifiers
        identifier_fields = get_identifier_fields(cls)
        if identifier_fields:
            args = ", ".join(f"{field}: String" for field in identifier_fields)
            field_definitions.append(f"    {base_name}({args}): {cls.__name__}")
    
    # Add context type
    registry = GlobalTypeRegistry()
    if context_name:
        if not registry.is_registered(context_name):
            context_type = f"""type {context_name} {{
{chr(10).join(field_definitions)}
}}"""
            registry.register_type(context_name, context_type)
            type_definitions.append(context_type)
    
            # Add query type extension
            query_type = f"""extend type Query {{
{context_name[0].lower() + context_name[1:]}: {context_name}!
}}"""
            registry.register_type("Query", query_type)
            type_definitions.append(query_type)
    
    else:
        query_type = f"""extend type Query {{
{chr(10).join(field_definitions)}
}}"""
        registry.register_type("Query", query_type)
        type_definitions.append(query_type)
    
    return "\n\n".join(type_definitions), all_resolvers