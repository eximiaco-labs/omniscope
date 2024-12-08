import globals


def resolve_active_deals(_, info, account_manager_slug=None, account_manager_name=None):
    return compute_active_deals(account_manager_slug, account_manager_name)

def resolve_active_deal(_, info, id=None):
    if id is not None:
        return globals.omni_models.active_deals.get_by_id(id)
    return None


def compute_active_deals(account_manager_slug=None, account_manager_name=None):
    all_deals = sorted(globals.omni_models.active_deals.get_all(), key=lambda deal: deal.title)
    
    if account_manager_slug:
        return [
            deal for deal in all_deals 
            if deal.account_manager and deal.account_manager.slug == account_manager_slug
        ]
        
    if account_manager_name:
        return [
            deal for deal in all_deals
            if deal.account_manager and deal.account_manager.name.lower() == account_manager_name.lower()
        ]
        
    return all_deals