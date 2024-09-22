import inspect
import functools


def dataframe(page_id, title):
    def decorator(func):
        func._dataframe = True
        func._df_page_id = page_id
        func._df_title = title

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    return decorator
