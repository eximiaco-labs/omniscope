import globals

def resolve_cases(_, info):
    all_cases = sorted(globals.omni_models.cases.get_all().values(), key=lambda case: case.title)
    return all_cases

def resolve_case(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.cases.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.cases.get_by_slug(slug)
    return None