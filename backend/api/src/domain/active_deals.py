
from omni_shared import globals

def resolve_active_deals(_, info, account_manager_slug=None, account_manager_name=None):
    return compute_active_deals(account_manager_slug, account_manager_name)

def resolve_active_deal(_, info, id=None):
    
    if id is not None:
        return globals.omni_models.active_deals.get_by_id(id)
    return None

def resolve_active_deal_client(deal, info):
    if isinstance(deal, dict):
        client_name = deal.get('client_or_prospect_name')
    else:
        client_name = deal.client_or_prospect_name
    
    if not client_name:
        return None
    
    return globals.omni_models.clients.get_by_name(client_name)

def resolve_active_deal_account_manager(deal, info):
    if isinstance(deal, dict):
        account_manager_name = deal.get('account_manager_name')
    else:
        account_manager_name = deal.account_manager_name
    
    if not account_manager_name:
        return None

    return globals.omni_models.workers.get_by_name(account_manager_name)

def resolve_active_deal_sponsor(deal, info):
    if isinstance(deal, dict):
        sponsor_name = deal.get('sponsor_name')
    else:
        sponsor_name = deal.sponsor_name
    
    if not sponsor_name:
        return None
    
    return globals.omni_models.sponsors.get_by_name(sponsor_name)

def compute_active_deals(account_manager_slug=None, account_manager_name=None):
    all_deals = globals.omni_models.active_deals.get_all()
    all_deals = filter(lambda deal: deal.status == 'open', all_deals)
    all_deals = sorted(all_deals, key=lambda deal: deal.title)
            
    if account_manager_slug:
        account_manager = globals.omni_models.workers.get_by_slug(account_manager_slug)
        all_deals = [
            deal for deal in all_deals 
            if deal.account_manager_name and deal.account_manager_name.lower() == account_manager.name.lower()
        ]
        
    if account_manager_name:
        all_deals = [
            deal for deal in all_deals
            if deal.account_manager_name and deal.account_manager_name.lower() == account_manager_name.lower()
        ]
        
    result = []
    for deal in all_deals:
        element = deal.model_dump(exclude_unset=False, exclude_defaults=False)
        result.append(element)
            
    return result
