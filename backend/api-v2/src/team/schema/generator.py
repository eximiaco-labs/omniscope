from typing import Type
from pydantic import BaseModel

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
        elif field_name == "id":
            gql_type = "ID"
            
        field_definitions.append(f"    {field_name}: {gql_type}!")
        
    return f"""type {cls.__name__} {{
{chr(10).join(field_definitions)}
}}"""

def generate_team_type(types: list[Type[BaseModel]]) -> str:
    """Generate the Team type definition dynamically based on available types"""
    field_definitions = []
    for cls in types:
        # Convert CamelCase to camelCase for field names
        field_name = cls.__name__[0].lower() + cls.__name__[1:] + "s"
        field_definitions.append(f"    {field_name}: [{cls.__name__}!]!")
        
    return f"""type Team {{
{chr(10).join(field_definitions)}
}}"""

def generate_query_type() -> str:
    """Generate the Query type definition"""
    return """extend type Query {
    team: Team!
}"""

def generate_schema(types: list[Type[BaseModel]]) -> str:
    """Generate complete GraphQL schema from types"""
    type_definitions = [generate_type(cls) for cls in types]
    type_definitions.append(generate_team_type(types))
    type_definitions.append(generate_query_type())
    
    return "\n\n".join(type_definitions) 