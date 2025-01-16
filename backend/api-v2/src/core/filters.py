from enum import Enum
from typing import Any, Dict, List, Optional, TypeVar, Generic
from pydantic import BaseModel, Field

T = TypeVar('T')

class SortOrder(str, Enum):
    ASC = "ASC"
    DESC = "DESC"

class SortInput(BaseModel):
    field: str
    order: SortOrder = SortOrder.ASC

class PaginationInput(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

class RangeFilter(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None

class FilterOperator(BaseModel):
    eq: Optional[Any] = None
    neq: Optional[Any] = None
    gt: Optional[float] = None
    gte: Optional[float] = None
    lt: Optional[float] = None
    lte: Optional[float] = None
    contains: Optional[str] = None
    range: Optional[RangeFilter] = None
    is_: Optional[bool] = Field(None, alias='is')

class FilterInput(BaseModel):
    and_: Optional[List['FilterInput']] = Field(None, alias='and')
    or_: Optional[List['FilterInput']] = Field(None, alias='or')
    not_: Optional['FilterInput'] = Field(None, alias='not')
    field: Optional[str] = None
    value: Optional[FilterOperator] = None

FilterInput.model_rebuild()

class CollectionMetadata(BaseModel):
    total: int
    filtered: int

class Collection(BaseModel, Generic[T]):
    data: List[T]
    metadata: CollectionMetadata

def apply_filters(items: List[T], filter_input: Optional[FilterInput] = None) -> List[T]:
    if not filter_input:
        return items

    def evaluate_filter(item: Any, filter_: FilterInput) -> bool:
        if filter_.and_:
            return all(evaluate_filter(item, f) for f in filter_.and_)
        if filter_.or_:
            return any(evaluate_filter(item, f) for f in filter_.or_)
        if filter_.not_:
            return not evaluate_filter(item, filter_.not_)
        
        if not filter_.field or not filter_.value:
            return True

        field_name = "".join(["_" + c.lower() if c.isupper() else c for c in filter_.field]).lstrip("_").replace(".", "_")
        value = getattr(item, field_name, None)
        op = filter_.value

        if op.eq is not None:
            return value == op.eq
        if op.neq is not None:
            return value != op.neq
        if op.gt is not None and isinstance(value, (int, float)):
            return value > op.gt
        if op.gte is not None and isinstance(value, (int, float)):
            return value >= op.gte
        if op.lt is not None and isinstance(value, (int, float)):
            return value < op.lt
        if op.lte is not None and isinstance(value, (int, float)):
            return value <= op.lte
        if op.contains is not None and isinstance(value, str):
            return op.contains.lower() in value.lower()
        if op.range is not None:
            if op.range.min is not None and value < op.range.min:
                return False
            if op.range.max is not None and value > op.range.max:
                return False
            return True 
        if op.is_ is not None:
            return bool(value) == op.is_
        
        return True

    return [item for item in items if evaluate_filter(item, filter_input)]

def apply_sort(items: List[T], sort_input: Optional[SortInput] = None) -> List[T]:
    if not sort_input:
        return items
    
    return sorted(
        items,
        key=lambda x: getattr(x, sort_input.field),
        reverse=sort_input.order == SortOrder.DESC
    )

def apply_pagination(items: List[T], pagination_input: Optional[PaginationInput] = None) -> List[T]:
    if not pagination_input:
        return items
    
    start = pagination_input.offset
    end = start + pagination_input.limit
    return items[start:end]

def process_collection(
    items: List[T],
    filter_input: Optional[FilterInput] = None,
    sort_input: Optional[SortInput] = None,
    pagination_input: Optional[PaginationInput] = None
) -> Collection[T]:
    total = len(items)
    
    # Apply operations in sequence
    filtered_items = apply_filters(items, filter_input)
    filtered_count = len(filtered_items)
    
    sorted_items = apply_sort(filtered_items, sort_input)
    final_items = apply_pagination(sorted_items, pagination_input)
    
    return Collection(
        data=final_items,
        metadata=CollectionMetadata(
            total=total,
            filtered=filtered_count
        )
    ) 