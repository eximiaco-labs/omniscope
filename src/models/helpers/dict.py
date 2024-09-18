def invert_dict(input_dict):
    result = {}

    for key, values in input_dict.items():
        for value in values:
            result.setdefault(value, []).append(key)

    return result
