import globals

def resolve_clients(_, info, account_manager_name=None):
    all_clients = sorted(globals.omni_models.clients.get_all().values(), key=lambda client: client.name)
    if account_manager_name:
        all_clients = [client for client in all_clients if client.account_manager and client.account_manager.name == account_manager_name]
    return all_clients

def resolve_client(_, info, id=None, slug=None):
    if id is not None:
        return globals.omni_models.clients.get_by_id(id)
    elif slug is not None:
        return globals.omni_models.clients.get_by_slug(slug)
    return None