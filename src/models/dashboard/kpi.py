import inspect
import functools
from models.helpers.weeks import Weeks


def weekly_kpi(
        family,
        title,
        number_of_weeks=4, enforce_last_weeks=True):
    def decorator(func):
        func._weekly_kpi = True
        func._family = family
        func._title = title
        func._number_of_weeks = number_of_weeks
        func._enforce_last_weeks = enforce_last_weeks


        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    return decorator


def compute_kpis_from(obj):
    result = []
    methods = inspect.getmembers(obj, predicate=inspect.ismethod)
    for name, method in methods:
        if getattr(method, '_weekly_kpi', False):
            summary = method()
            if len(summary) > 0:
                number_of_weeks = getattr(method, '_number_of_weeks', None)
                enforce_last_weeks = getattr(method, '_enforce_last_weeks', True)
                family = getattr(method, '_family', None)

                o = {
                    'key': f'kpi/{family}/{name}',
                    'family': family,
                    'title': getattr(method, '_title', None)
                }

                data = {}
                weeks_level = summary.columns.get_level_values(1)

                if not enforce_last_weeks:
                    for label in weeks_level[-number_of_weeks:]:
                        value = summary[("Weeks", label)].sum()
                        data[label] = value
                else:
                    for i in reversed(range(number_of_weeks)):
                        label = Weeks.get_previous_string(i)
                        if label in weeks_level:
                            value = summary[("Weeks", label)].sum()
                        else:
                            value = 0
                        data[label] = value

                o['data'] = data
                o['source'] = summary

                params = inspect.signature(method).parameters
                if 'summarize' in params:
                    o['raw'] = method(summarize=False)

                result.append(o)

    return result



