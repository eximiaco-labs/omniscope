from .timesheets import resolve_timesheet

from utils.fields import get_selections_from_info

from typing import Any, Dict, List
from graphql import GraphQLResolveInfo

def resolve_this_week(_, info: GraphQLResolveInfo, kind: str = "ALL") -> Dict[str, Any]:
    slug = "this-week"
    
    all_selections = get_selections_from_info(info)
    requested_fields = list(map(lambda s: s.name.value, all_selections))

    result: Dict[str, Any] = {}

    if 'timesheet' in requested_fields:
        # Get the timesheet data for this week
        timesheet_info = next((s for s in all_selections if s.name.value == 'timesheet'), None)
        if timesheet_info:
            # Create a new GraphQLResolveInfo object with the timesheet field
            timesheet_info_context = GraphQLResolveInfo(
                field_name='timesheet',
                field_nodes=[timesheet_info],
                return_type=info.return_type,
                parent_type=info.parent_type,
                schema=info.schema,
                fragments=info.fragments,
                root_value=info.root_value,
                operation=info.operation,
                variable_values=info.variable_values,
                context=info.context,
                path=info.path,
                is_awaitable=info.is_awaitable
            )
            result['timesheet'] = resolve_timesheet(_, timesheet_info_context, slug=slug, kind=kind)
    
    return result