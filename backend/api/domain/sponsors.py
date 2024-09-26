import globals

def resolve_sponsors(_, info):
    all_sponsors = sorted(globals.omni_models.sponsors.get_all().values(), key=lambda sponsor: sponsor.name)
    return all_sponsors

def resolve_sponsor(_, info, slug=None):
    if slug is not None:
        return globals.omni_models.sponsors.get_by_slug(slug)
    return None