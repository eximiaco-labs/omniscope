from omni_shared import globals


def resolve_offers(_, info):
    all_sponsors = sorted(globals.omni_models.products_or_services.get_all().values(), key=lambda offer: offer.name)
    return all_sponsors

def resolve_offer(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.products_or_services.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.products_or_services.get_by_slug(slug)
    return None