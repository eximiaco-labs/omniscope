from typing import Type, List, Optional, Union, Any, Dict, Callable
from pydantic import BaseModel
from datetime import datetime, date
import inspect
import re

from omni_shared import globals

class GlobalRepository:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _get_value(self, obj: Any, field_name: str) -> Any:
        """Helper method to get a value from either an object or a dictionary."""
        if isinstance(obj, dict):
            return obj.get(field_name)
        else:
            return getattr(obj, field_name, None)
    
    def get_by_id(self, type_name: str, id: str):
        if type_name == "Client":
            return globals.omni_models.clients.get_by_id(id)
        elif type_name == "Case":
            return globals.omni_models.cases.get_by_id(id)
    
    def get_by_slug(self, type_name: str, slug: str):
        if type_name == "AccountManager":
            from team.models import AccountManager
            return AccountManager.from_domain(globals.omni_models.workers.get_by_slug(slug))
        elif type_name == "ConsultantOrEngineer":
            from team.models import ConsultantOrEngineer
            return ConsultantOrEngineer.from_domain(globals.omni_models.workers.get_by_slug(slug))
        elif type_name == "Client":
            from engagements.models import Client
            return Client.from_domain(globals.omni_models.clients.get_by_slug(slug))
        elif type_name == "Sponsor":
            from engagements.models import Sponsor
            return Sponsor.from_domain(globals.omni_models.sponsors.get_by_slug(slug))
        elif type_name == "Case":
            from engagements.models import Case
            return Case.from_domain(globals.omni_models.cases.get_by_slug(slug))
    
    def get_resolver_by_id(self, entity_name: str, field_name: str):
        def resolver(parent, info):
            value = self._get_value(parent, field_name)
            return self._instance.get_by_id(entity_name, value) if value else None
        return resolver

    def get_resolver_by_slug(self, entity_name: str, field_name: str):
        def resolver(parent, info):
            value = self._get_value(parent, field_name)
            return self._instance.get_by_slug(entity_name, value) if value else None
        return resolver
              

class FilterableField(BaseModel):
    field: str
    selected_values: Optional[List[str]] = []
    options: Optional[List[str]] = []

class GlobalTypeRegistry:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.types = {}
            cls._instance.query_fields = []
            cls._instance.type_parameters = {}  # Store query parameters for each type
            cls._instance.resolvers = {}  # Store resolvers for each type
            
            cls._instance.register_type('Query', 'type Query { version: String! }', [], {})
        return cls._instance

    def register_type(self, type_name: str, type_def: str, parameters: List[str] = None, resolvers: Dict[str, Callable] = None):
        # Special handling for Query type
        if type_name == "Query":
            # Extract fields from the Query type extension
            field_lines = type_def.split("\n")[1:-1]  # Skip first and last lines
            self.query_fields.extend(line.strip() for line in field_lines if line.strip())
        else:
            self.types[type_name] = type_def
            if parameters:
                self.type_parameters[type_name] = parameters
            if resolvers:
                self.resolvers.update(resolvers)
    
    def is_registered(self, type_name: str) -> bool:
        return type_name in self.types

    def get_type_parameters(self, type_name: str) -> List[str]:
        return self.type_parameters.get(type_name, [])

    def get_all_types(self) -> Dict[str, str]:
        types = dict(self.types)
        if self.query_fields:
            query_type = """type Query {
  %s
}""" % "\n  ".join(self.query_fields)
            types["Query"] = query_type
        return types

    def get_resolvers(self) -> Dict[str, Callable]:
        return self.resolvers

    def generate_sdl(self) -> str:
        return "\n\n".join(self.get_all_types().values())
    
    def clear(self):
        self.types = {}
        self.query_fields = []
        self.type_parameters = {}
        self.resolvers = {}

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
    
def has_filter_field(cls: Type[BaseModel]) -> bool:
    """Check if the model has a filter field"""
    return "filterable_fields" in cls.model_fields

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

def generate_input_type(cls: Type[BaseModel]) -> str:
    """Generate a GraphQL input type from a Pydantic model"""
    registry = GlobalTypeRegistry()
    input_type_name = f"{cls.__name__}Input"
    
    # Se já está registrado, não precisa gerar novamente
    if registry.is_registered(input_type_name):
        return ""
    
    field_definitions = []
    for field_name, field in cls.model_fields.items():
        field_type = field.annotation
        has_default = field.default is not None or field.default is None and field.default_factory is None
        is_optional = has_default or getattr(field_type, "__origin__", None) is Optional
        
        # Get the actual type
        if hasattr(field_type, "__origin__"):
            if field_type.__origin__ in (list, List):
                inner_type = field_type.__args__[0]
                if inspect.isclass(inner_type) and issubclass(inner_type, BaseModel):
                    gql_type = f"[{inner_type.__name__}Input]"
                else:
                    gql_type = f"[{get_scalar_type(inner_type)}]"
            elif field_type.__origin__ in (Union, Optional):
                for arg in field_type.__args__:
                    if arg != type(None):  # noqa
                        if inspect.isclass(arg) and issubclass(arg, BaseModel):
                            gql_type = f"{arg.__name__}Input"
                        else:
                            gql_type = get_scalar_type(arg)
                        break
        elif inspect.isclass(field_type) and issubclass(field_type, BaseModel):
            gql_type = f"{field_type.__name__}Input"
        else:
            gql_type = get_scalar_type(field_type)
        
        # Convert field name to camelCase
        camel_field_name = to_camel_case(field_name)
        field_definitions.append(f"    {camel_field_name}: {gql_type}{'!' if not is_optional else ''}")
    
    input_type = f"""input {input_type_name} {{
{chr(10).join(field_definitions)}
}}"""
    
    # Registra o tipo de input
    registry.register_type(input_type_name, input_type)
    return input_type

def get_scalar_type(type_annotation) -> str:
    """Get the GraphQL scalar type for a Python type"""
    if type_annotation == str:
        return "String"
    elif type_annotation == int:
        return "Int"
    elif type_annotation == float:
        return "Float"
    elif type_annotation == bool:
        return "Boolean"
    elif type_annotation == datetime:
        return "DateTime"
    elif type_annotation == date:
        return "Date"
    return "String"  # fallback

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
            "int": "Int",
            "float": "Float",
            "bool": "Boolean",
            "datetime": "DateTime",
            "date": "Date",
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
            "int": "Int",
            "float": "Float",
            "bool": "Boolean",
            "datetime": "DateTime",
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

def generate_method_resolver(method):
    """Generate a resolver function for a class method that is compatible with Ariadne.
    The generated resolver will maintain the original method's parameters while adding the required
    obj and info parameters expected by Ariadne."""
    import inspect
    
    # Get method signature
    sig = inspect.signature(method)
    params = list(sig.parameters.values())
    
    # Skip 'self' parameter if it exists
    if params and params[0].name == 'self':
        params = params[1:]
    
    def resolver(obj, info, **kwargs):
        # Convert camelCase parameters back to snake_case for the method call
        snake_case_kwargs = {
            to_snake_case(key): value
            for key, value in kwargs.items()
        }
        # Call the original method with the snake_case arguments
        return method(obj, **snake_case_kwargs)
    
    # Update resolver signature to match GraphQL expectations
    resolver.__name__ = method.__name__
    resolver.__doc__ = method.__doc__
    
    return resolver

def get_inner_type_for_graphql(type_annotation, type_definitions, resolvers, registry, generated_types, is_input=False):
    """Helper function to get the GraphQL type for a given Python type annotation"""
    if type_annotation == str:
        return "String"
    elif type_annotation == int:
        return "Int"
    elif type_annotation == float:
        return "Float"
    elif type_annotation == bool:
        return "Boolean"
    elif type_annotation == date:
        return "Date"
    elif inspect.isclass(type_annotation) and issubclass(type_annotation, BaseModel):
        type_name = type_annotation.__name__
        if is_input:
            input_type_name = f"{type_name}Input"
            # Generate input type if not already registered
            if not registry.is_registered(input_type_name):
                input_type = generate_input_type(type_annotation)
                if input_type:
                    type_definitions.append(input_type)
                    # Também gera o tipo regular se ainda não existir
                    if not registry.is_registered(type_name):
                        nested_type, nested_resolvers = generate_type(type_annotation, generated_types)
                        if nested_type:
                            type_definitions.append(nested_type)
                            resolvers.update(nested_resolvers)
            return input_type_name
        else:
            # Generate regular type if not already registered
            if not registry.is_registered(type_name):
                nested_type, nested_resolvers = generate_type(type_annotation, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
            return type_name
    return "String"  # fallback

def generate_namespace_resolver(cls: Type[BaseModel]) -> Callable:
    """Generate a resolver for namespace types that returns an instance of the class."""
    def resolver(parent, info):
        return cls()
    return resolver

def generate_type(cls: Type[BaseModel], generated_types: set[str] = None) -> tuple[str, Dict[str, Callable]]:
    """Generate GraphQL type definition from a Pydantic model and its resolvers"""
    registry = GlobalTypeRegistry()
    repository = GlobalRepository()
    
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
    if has_filter_field(cls):
        parameters.append("filters: [DatasetFilterInput]")
    
    # Generate resolvers for methods if class is namespaced
    is_namespace = hasattr(cls, '_is_namespace')
    if is_namespace:
        import inspect
        
        # Add resolver for the namespace type itself
        namespace_resolver = generate_namespace_resolver(cls)
        # Registra o resolver com o caminho completo (ex: "Engagements.summaries")
        resolver_key = f"{cls.__module__.split('.')[-2].title()}.{to_camel_case(cls.__name__.lower())}"
        resolvers[resolver_key] = namespace_resolver
        registry.resolvers[resolver_key] = namespace_resolver
        
        # Get only methods defined in the class itself, not inherited ones
        methods = [
            (name, method) for name, method in inspect.getmembers(cls, predicate=inspect.isfunction)
            if method.__qualname__.startswith(cls.__name__) and not name.startswith('__')
        ]
        
        for method_name, method in methods:
            # Get method signature
            sig = inspect.signature(method)
            params = list(sig.parameters.values())[1:]  # Skip 'self'
            
            # Convert parameters to GraphQL arguments
            args = []
            for param in params:
                param_type = "String"  # Default type
                is_required = param.default == inspect.Parameter.empty
                
                # Get type annotation if available
                if param.annotation != inspect.Parameter.empty:
                    if param.annotation == str:
                        param_type = "String"
                    elif param.annotation == int:
                        param_type = "Int"
                    elif param.annotation == float:
                        param_type = "Float"
                    elif param.annotation == bool:
                        param_type = "Boolean"
                    elif param.annotation == date:
                        param_type = "Date"
                    elif hasattr(param.annotation, "__origin__"):
                        origin = param.annotation.__origin__
                        if origin == list or origin == List:
                            inner_type = param.annotation.__args__[0]
                            param_type = get_inner_type_for_graphql(inner_type, type_definitions, resolvers, registry, generated_types, is_input=True)
                            param_type = f"[{param_type}]"
                        elif origin in (Union, Optional):
                            # Handle Optional types
                            for arg in param.annotation.__args__:
                                if arg != type(None):  # noqa
                                    if hasattr(arg, "__origin__") and (arg.__origin__ == list or arg.__origin__ == List):
                                        # Handle Optional[List[...]]
                                        list_inner_type = arg.__args__[0]
                                        param_type = get_inner_type_for_graphql(list_inner_type, type_definitions, resolvers, registry, generated_types, is_input=True)
                                        param_type = f"[{param_type}]"
                                    else:
                                        param_type = get_inner_type_for_graphql(arg, type_definitions, resolvers, registry, generated_types, is_input=True)
                                    break
                    # Handle direct complex types (not in a list/optional)
                    elif (inspect.isclass(param.annotation) and 
                          issubclass(param.annotation, BaseModel)):
                        param_type = get_inner_type_for_graphql(param.annotation, type_definitions, resolvers, registry, generated_types, is_input=True)
                
                # Convert parameter name to camelCase for GraphQL
                camel_param_name = to_camel_case(param.name)
                args.append(f"{camel_param_name}: {param_type}{'!' if is_required else ''}")
            
            # Get return type annotation
            return_type = "JSON"  # Default return type
            if sig.return_annotation != inspect.Parameter.empty:
                if hasattr(sig.return_annotation, "__name__"):
                    return_type = sig.return_annotation.__name__
                    
                    # If return type is a Pydantic model and not yet registered, generate its type
                    if (
                        inspect.isclass(sig.return_annotation) and 
                        issubclass(sig.return_annotation, BaseModel) and 
                        not registry.is_registered(return_type)
                    ):
                        # Gerar tipo e resolvers para o tipo de retorno
                        nested_type, nested_resolvers = generate_type(sig.return_annotation, generated_types)
                        if nested_type:
                            type_definitions.append(nested_type)
                            resolvers.update(nested_resolvers)
                            
                            # Adicionar resolvers para campos _slug e _id do tipo de retorno
                            for field_name, field in sig.return_annotation.model_fields.items():
                                if field_name.endswith("_slug"):
                                    base_name = field_name[:-5]  # Remove _slug suffix
                                    type_name = "".join(word.capitalize() for word in base_name.split("_"))
                                    resolver_key = f"{return_type}.{to_camel_case(base_name)}"
                                    resolvers[resolver_key] = repository.get_resolver_by_slug(type_name, field_name)
                                    registry.resolvers[resolver_key] = resolvers[resolver_key]
                                elif field_name.endswith("_id"):
                                    base_name = field_name[:-3]  # Remove _id suffix
                                    type_name = "".join(word.capitalize() for word in base_name.split("_"))
                                    resolver_key = f"{return_type}.{to_camel_case(base_name)}"
                                    resolvers[resolver_key] = repository.get_resolver_by_id(type_name, field_name)
                                    registry.resolvers[resolver_key] = resolvers[resolver_key]
            
            # Add field definition with camelCase method name
            camel_method_name = to_camel_case(method_name)
            field_definitions.append(f"    {camel_method_name}({', '.join(args)}): {return_type}!")
            
            # Generate resolver and register it
            resolver = generate_method_resolver(method)
            resolver_key = f"{cls.__name__}.{camel_method_name}"
            resolvers[resolver_key] = resolver
            registry.resolvers[resolver_key] = resolver
    
    # Generate the base type first
    type_def = f"""type {cls.__name__} {{
{chr(10).join(field_definitions)}
}}"""
    
    # Register the type with its parameters and resolvers
    registry.register_type(cls.__name__, type_def, parameters, resolvers)
    
    # Generate collection type immediately after the base type, but only if not a namespace
    if not is_namespace:
        collection_type = generate_collection_type(cls)
        type_definitions.append(collection_type)
        generated_types.add(f"{cls.__name__}Collection")
    
    for field_name, field in cls.model_fields.items():
        field_type = field.annotation
        has_default = field.default is not None or field.default is None and field.default_factory is None
        is_optional_type = getattr(field_type, "__origin__", None) is Optional
        is_optional = has_default or is_optional_type
        
        # Get the actual type and inner type
        actual_type = get_field_type(field_type)
        inner_type = get_inner_type(field_type)
        
        # Initialize type variables
        is_list = actual_type == list
        is_dict = actual_type == dict
        gql_type = None
        
        # Convert field name to camelCase
        camel_field_name = to_camel_case(field_name)
        
        # Handle _id fields
        if field_name.endswith("_id"):
            base_name = field_name[:-3]  # Remove _id suffix
            # Convert to PascalCase
            gql_type = "".join(word.capitalize() for word in base_name.split("_"))
            camel_field_name = to_camel_case(base_name)
            
            # Add resolver that throws exception
            resolver = repository.get_resolver_by_id(gql_type, field_name)
            
            # Register resolver in the registry
            registry.resolvers[f"{cls.__name__}.{camel_field_name}"] = resolver
            
            field_definitions.append(f"    {camel_field_name}: {gql_type}{'!' if not is_optional else ''}")
            continue
        
        # Handle _slug fields
        if field_name.endswith("_slug"):
            base_name = field_name[:-5]  # Remove _slug suffix
            # Convert to PascalCase
            gql_type = "".join(word.capitalize() for word in base_name.split("_"))
            camel_field_name = to_camel_case(base_name)
            
            # Add resolver that throws exception
            resolver = repository.get_resolver_by_slug(gql_type, field_name)
            
            # Register resolver in the registry
            registry.resolvers[f"{cls.__name__}.{camel_field_name}"] = resolver
            
            field_definitions.append(f"    {camel_field_name}: {gql_type}{'!' if not is_optional else ''}")
            continue
        
        # Determine GraphQL type for non-_id fields
        if is_dict:
            if isinstance(inner_type, type) and issubclass(inner_type, BaseModel):
                nested_type, nested_resolvers = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
                gql_type = f"{inner_type.__name__}Collection"
                
                # Get parameters for the inner type
                inner_params = registry.get_type_parameters(inner_type.__name__)
                
                if not inner_params:
                    param_args = ""
                else:
                    p = [
                        f"{param}: String" if ":" not in param else param
                        for param in inner_params
                    ]
                    param_args = ", ".join(p)
                
                param_str = f"({param_args}, " if param_args else "("
                
                field_definitions.append(f"    {camel_field_name}{param_str}filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                # Generate resolver for discovered nested types
                registry.resolvers[f"{cls.__name__}.{camel_field_name}"] = generate_default_resolver(field_name)
                continue
            else:
                gql_type = f"[{get_type_name(inner_type)}]"
        elif is_list and field_name == "filterable_fields":
            gql_type = "[FilterableField!]"
        elif is_list:
            if isinstance(inner_type, type) and issubclass(inner_type, BaseModel):
                nested_type, nested_resolvers = generate_type(inner_type, generated_types)
                if nested_type:
                    type_definitions.append(nested_type)
                    resolvers.update(nested_resolvers)
                gql_type = f"{inner_type.__name__}Collection"
                
                # Get parameters for the inner type
                inner_params = registry.get_type_parameters(inner_type.__name__)
                
                if not inner_params:
                    param_args = ""
                else:
                    p = [
                        f"{param}: String" if ":" not in param else param
                        for param in inner_params
                    ]
                    param_args = ", ".join(p)
                
                param_str = f"({param_args}, " if param_args else "("
                
                field_definitions.append(f"    {camel_field_name}{param_str}filter: FilterInput, sort: SortInput, pagination: PaginationInput): {gql_type}{'!' if not is_optional else ''}")
                # Generate resolver for discovered nested types
                registry.resolvers[f"{cls.__name__}.{camel_field_name}"] = generate_default_resolver(field_name)
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
                    if not inner_params:
                        param_args = ""
                    else:
                        p = [
                            f"{param}: String" if ":" not in param else param
                            for param in inner_params
                        ]
                        param_args = ", ".join(p)
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

    # Register the type with its parameters and resolvers
    registry.register_type(cls.__name__, type_def, parameters, resolvers)
    
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
    
    if not registry.is_registered("DatasetFilterInput"):
        dataset_filter = """input DatasetFilterInput {
  field: String!
  selectedValues: [String!]!
}"""
        registry.register_type("DatasetFilterInput", dataset_filter)
        type_definitions.append(dataset_filter)
    
    if not registry.is_registered("FilterableField"):
        
        dataset_filterable_fields = """type FilterableField {
  field: String!
  selectedValues: [String!]!
  options: [String!]!
}"""

        registry.register_type("FilterableField", dataset_filterable_fields)
        type_definitions.append(dataset_filterable_fields)
    
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
    is: Boolean
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
        
    if not registry.is_registered("Date"):
        scalar_date = "scalar Date"
        registry.register_type("Date", scalar_date)
        type_definitions.append(scalar_date)

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
    registry = GlobalTypeRegistry()
    
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
        # Check if class is marked as namespace
        is_namespace = hasattr(cls, '_is_namespace')
        
        if is_namespace:
            # For namespaced classes, use camelCase for field name but keep PascalCase for type
            field_name = to_camel_case(cls.__name__[0].lower() + cls.__name__[1:])
            field_definitions.append(f"    {field_name}: {cls.__name__}!")
            continue
            
        # Get the base name in camelCase
        base_name = to_camel_case(cls.__name__[0].lower() + cls.__name__[1:])
        
        # Collection field - properly pluralized
        # Only add collection field if we have a context and the class is not a namespace
        if context_name and not is_namespace:
            collection_name = pluralize(base_name)
            collection_args = "(filter: FilterInput, sort: SortInput, pagination: PaginationInput)"
            field_definitions.append(f"    {collection_name}{collection_args}: {cls.__name__}Collection!")
            
        # Single item fields based on identifiers
        identifier_fields = get_identifier_fields(cls)

        if identifier_fields:
            args = ", ".join(f"{field}: String" for field in identifier_fields)
            if has_filter_field(cls):
                args += ", filters: [DatasetFilterInput]"
            field_definitions.append(f"    {base_name}({args}): {cls.__name__}")
    
    # Add context type
    if context_name:
        if not registry.is_registered(context_name):
            context_type = f"""type {context_name} {{
{chr(10).join(field_definitions)}
}}"""
            registry.register_type(context_name, context_type, resolvers=all_resolvers)
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
        registry.register_type("Query", query_type, resolvers=all_resolvers)
        type_definitions.append(query_type)
    
    return "\n\n".join(type_definitions), all_resolvers