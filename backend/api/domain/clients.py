import globals

def resolve_clients(_, info):
    all_clients = sorted(globals.omni_models.clients.get_all().values(), key=lambda client: client.name)
    return all_clients

def resolve_client(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.clients.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.clients.get_by_slug(slug)
    return None