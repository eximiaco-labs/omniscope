def find_first_occurrence(dicts_list, value, key='key'):
    if isinstance(dicts_list, dict):
        return dicts_list.get(value, None)

    for d in dicts_list:
        if d.get(key) == value:
            return d
    return None
