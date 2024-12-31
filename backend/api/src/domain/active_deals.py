from omni_shared import globals


def resolve_active_deals(_, info, account_manager_slug=None, account_manager_name=None):
    return compute_active_deals(account_manager_slug, account_manager_name)

def resolve_active_deal(_, info, id=None):
    if id is not None:
        return globals.omni_models.active_deals.get_by_id(id)
    return None

def resolve_active_deal_client(deal, info):
    return globals.omni_models.clients.get_by_name(deal.client_or_prospect_name)

def resolve_active_deal_account_manager(deal, info):
    return globals.omni_models.workers.get_by_name(deal.account_manager_name)


def compute_active_deals(account_manager_slug=None, account_manager_name=None):
    all_deals = globals.omni_models.active_deals.get_all()
    all_deals = filter(lambda deal: deal.status == 'open', all_deals)
    all_deals = sorted(all_deals, key=lambda deal: deal.title)
            
    if account_manager_slug:
        all_deals = [
            deal for deal in all_deals 
            if deal.account_manager and deal.account_manager.slug == account_manager_slug
        ]
        
    if account_manager_name:
        all_deals = [
            deal for deal in all_deals
            if deal.account_manager and deal.account_manager.name.lower() == account_manager_name.lower()
        ]
        
    result = []
    for deal in all_deals:
        element = deal.model_dump(exclude_unset=False, exclude_defaults=False)
        result.append(element)
            
    return result
