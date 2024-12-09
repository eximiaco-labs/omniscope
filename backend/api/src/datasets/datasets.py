from omni_shared import globals


def resolve_datasets(_, info, kind: str = None):
    result = globals.omni_datasets.get_datasets()
    if kind:
        result = filter(lambda r: r["kind"] == kind, result)
    return result
