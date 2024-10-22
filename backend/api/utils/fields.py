from typing import List, Any

def get_requested_fields_from(info):
    selections = info.field_nodes[0].selection_set.selections
    requested_fields = list(map(lambda s: s.name.value, selections))

    for selection in selections:
        if selection.kind == 'fragment_spread':
           fragment = info.fragments[selection.name.value]
           fragment_selections = fragment.selection_set.selections
           fragment_requested_fields = list(map(lambda s: s.name.value, fragment_selections))
           requested_fields += fragment_requested_fields

    return requested_fields

def generate_info_to(field: str, basedon):
    pass

def get_selections_from_selection_set(selection_set, info) -> List[Any]:
    result = []

    for selection in selection_set.selections:
        if selection.kind == 'field':
            result.append(selection)
        elif selection.kind == 'fragment_spread':
            fragment = info.fragments[selection.name.value]
            result.extend(get_selections_from_selection_set(fragment.selection_set))
        elif selection.kind == 'inline_fragment':
            result.extend(get_selections_from_selection_set(selection.selection_set))
    
    return result

def get_selections_from_info(info):
    return get_selections_from_selection_set(info.field_nodes[0].selection_set, info)
