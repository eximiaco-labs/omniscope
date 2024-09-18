import inspect
import functools

import pandas as pd
from models.base.powerdataframe import PowerDataFrame


def x9(family: str = None):
    def decorator(func):
        func._x9 = True
        func._family = family

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    return decorator


def compute_x9s_from(obj):
    result = []
    methods = inspect.getmembers(obj, predicate=inspect.ismethod)
    for name, method in methods:
        if getattr(method, '_x9', False):
            source = method()

            if isinstance(source, PowerDataFrame):
                num_rows = source.len()
            else:
                num_rows = len(source)

            if num_rows > 0:
                family = getattr(method, '_family', None)
                o = {
                    'key': f'x9/{family}/{name}',
                    'family': family,
                    'title': __parse_method_name(name, family),
                    'value': num_rows,
                    'source': source
                }
                result.append(o)

    return result


def __parse_method_name(s: str, family: str) -> str:
    parts = s.split('_')

    if parts[0] == 'find':
        parts = parts[1:]

    if parts[0] == family or parts[0] == 'active':
        parts = parts[1:]

    if parts[0] == family or parts[0] == 'active':
        parts = parts[1:]

    title = ' '.join(__adjust_word(word) for word in parts)

    return title

def __adjust_word(word: str) -> str:
    # Dictionary mapping specific words to their replacements
    replacements = {
        'per': '/',
        'with': 'with',
        'without': 'without',
        'this': 'this',
        'wtf': 'WTF'
    }

    # Return the mapped replacement if it exists, otherwise capitalize the word
    return replacements.get(word, word.capitalize())
