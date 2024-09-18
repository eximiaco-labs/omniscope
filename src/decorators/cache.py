import functools
import hashlib
import logging
import os
import pickle

logger = logging.getLogger(__name__)


def _make_key(func, args, kwargs):
    key = f"{func.__name__}:{args}:{kwargs}"
    logger.info(f'Generating a hash key for: {key}')
    return hashlib.md5(key.encode()).hexdigest()


def cache(func=None, *, remember=False):
    if func is None:
        return lambda func: cache(func, remember=remember)

    @functools.wraps(func)
    def wrapped(instance, *args, **kwargs):
        if not hasattr(instance, 'cache') or instance.cache is None:
            instance.cache = {}
        key = _make_key(func, args, kwargs)
        cache_dir = 'cache'
        cache_file = os.path.join(cache_dir, key)

        if key in instance.cache:
            logger.info(f"Cache hit for {key}")
            return instance.cache[key]
        elif remember and os.path.isfile(cache_file):
            logger.info(f"Cache hit (file) for {key}")
            with open(cache_file, 'rb') as f:
                result = pickle.load(f)
            instance.cache[key] = result
            return result
        else:
            logger.info(f"Cache miss for {key}")
            result = func(instance, *args, **kwargs)
            instance.cache[key] = result

            if remember:
                if not os.path.exists(cache_dir):
                    os.makedirs(cache_dir)
                with open(cache_file, 'wb') as f:
                    pickle.dump(result, f)

            return result

    return wrapped


def invalidate_cache(instance, func=None, args=None, kwargs=None):
    if hasattr(instance, 'cache') and instance.cache is not None:
        if func and args is not None and kwargs is not None:
            key = _make_key(func, args, kwargs)
            if key in instance.cache:
                del instance.cache[key]
                logger.info(f"Cache invalidated for {key}")
                cache_file = os.path.join('cache', key)
                if os.path.isfile(cache_file):
                    os.remove(cache_file)
                    logger.info(f"Cache file removed for {key}")
        else:
            instance.cache.clear()
            logger.info("Entire cache invalidated")
            for file in os.listdir('cache'):
                os.remove(os.path.join('cache', file))
            logger.info("All cache files removed")
