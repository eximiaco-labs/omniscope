from functools import wraps
from typing import Callable, TypeVar, List

from .filters import process_collection, FilterInput, SortInput, PaginationInput

T = TypeVar('T')

def collection(func: Callable[..., List[T]]) -> Callable:
    """
    Decorator that wraps a resolver to handle collection processing.
    The wrapped function should return a list of items.
    The decorator will handle filtering, sorting and pagination.
    """
    @wraps(func)
    def wrapper(obj, info, filter: dict = None, sort: dict = None, pagination: dict = None, **kwargs):
        # Get the base collection
        items = func(obj, info, **kwargs)
        
        # Process filters, sort and pagination
        filter_input = FilterInput.model_validate(filter) if filter else None
        sort_input = SortInput.model_validate(sort) if sort else None
        pagination_input = PaginationInput.model_validate(pagination) if pagination else None
        
        result = process_collection(
            items,
            filter_input=filter_input,
            sort_input=sort_input,
            pagination_input=pagination_input
        )
        
        return result.model_dump()
    
    return wrapper 