from graphql import GraphQLResolveInfo
import globals


def resolve_cases(_, info, only_actives: bool = False):
    all_cases = globals.omni_models.cases.get_all().values()

    if only_actives:
        all_cases = filter(lambda case: case.is_active, all_cases)

    all_cases = sorted(all_cases, key=lambda case: case.title)

    return map(
        lambda x: _make_result_object(info, x),
        all_cases
    )

def resolve_case(_, info: GraphQLResolveInfo, id=None, slug=None):
    case = None
    if id is not None:
        case = globals.omni_models.cases.get_by_id(id)
        if case is None:
            case = globals.omni_models.cases.get_by_slug(id)
    elif slug is not None:
        case = globals.omni_models.cases.get_by_slug(slug)
        if case is None:
            case = globals.omni_models.cases.get_by_id(slug)
    
    if case is not None:
        return _make_result_object(info, case)
    
    return None

def _make_result_object(info: GraphQLResolveInfo, case):
    result = {**case.__dict__}
    
    # Add all properties
    for prop in dir(case):
        if not prop.startswith('_') and prop not in result:
            result[prop] = getattr(case, prop)

    field_node = info.field_nodes[0]
    selection_set = field_node.selection_set
    selections = selection_set.selections

    if any(x.name.value == 'client' for x in selections):
        if case.client_id:
            result['client'] = globals.omni_models.clients.get_by_id(case.client_id)

    if any(x.name.value == 'sponsor' for x in selections):
        result['sponsor'] = case.sponsor

    return result