from typing import Any
from pydantic import Field

def Id(description: str = "Unique Identifier", **kwargs: Any) -> Any:
    """
    Creates a field marked as an identifier.
    Fields marked with this decorator will be used to generate single-item queries.
    """
    return Field(
        ...,
        description=description,
        json_schema_extra={"is_identifier": True},
        **kwargs
    ) 