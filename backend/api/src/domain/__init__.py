from ariadne import QueryType, ObjectType

from .user import resolve_user
from .account_managers import resolve_account_manager_cases, resolve_account_manager_forecast, resolve_account_manager_timesheet, resolve_account_managers, resolve_account_manager, resolve_account_manager_active_deals
from .consultants_engineers import resolve_consultant_or_engineer_staleliness, resolve_consultant_or_engineer_timeliness_review, resolve_consultants_and_engineers, resolve_consultant_or_engineer, resolve_consultant_or_engineer_timesheet
from .clients import resolve_client_forecast, resolve_client_timesheet, resolve_clients, resolve_client
from .sponsors import resolve_sponsor_forecast, resolve_sponsor_timesheet, resolve_sponsors, resolve_sponsor
from .cases import resolve_case_forecast, resolve_case_timesheet, resolve_cases, resolve_case
from .offers import resolve_offers, resolve_offer
from .projects import resolve_projects
from .active_deals import resolve_active_deals, resolve_active_deal, compute_active_deals, resolve_active_deal_client, resolve_active_deal_account_manager, resolve_active_deal_sponsor

def setup_query_for_domain(query: QueryType):
    query.set_field("accountManagers", resolve_account_managers)
    query.set_field("accountManager", resolve_account_manager)
    query.set_field("consultantsAndEngineers", resolve_consultants_and_engineers)
    query.set_field("consultantOrEngineer", resolve_consultant_or_engineer)
    query.set_field("clients", resolve_clients)
    query.set_field("client", resolve_client)
    query.set_field("sponsors", resolve_sponsors)
    query.set_field("sponsor", resolve_sponsor)
    query.set_field("cases", resolve_cases)
    query.set_field("case", resolve_case)
    query.set_field("offers", resolve_offers)
    query.set_field("offer", resolve_offer)
    query.set_field("projects", resolve_projects)
    query.set_field("user", resolve_user)
    query.set_field("activeDeals", resolve_active_deals)
    query.set_field("activeDeal", resolve_active_deal) 

    client_type = ObjectType('Client')
    client_type.set_field('timesheet', resolve_client_timesheet)
    client_type.set_field('forecast', resolve_client_forecast)
    
    
    account_manager_type = ObjectType('AccountManager')
    account_manager_type.set_field('timesheet', resolve_account_manager_timesheet)
    account_manager_type.set_field('cases', resolve_account_manager_cases)
    account_manager_type.set_field('activeDeals', resolve_account_manager_active_deals) 
    account_manager_type.set_field('forecast', resolve_account_manager_forecast)
    
    consultant_or_engineer_type = ObjectType('Worker')
    consultant_or_engineer_type.set_field('timesheet', resolve_consultant_or_engineer_timesheet)
    consultant_or_engineer_type.set_field('timelinessReview', resolve_consultant_or_engineer_timeliness_review)
    consultant_or_engineer_type.set_field('staleliness', resolve_consultant_or_engineer_staleliness)

    sponsor_type = ObjectType('Sponsor')
    sponsor_type.set_field('timesheet', resolve_sponsor_timesheet)
    sponsor_type.set_field('forecast', resolve_sponsor_forecast)
    
    case_type = ObjectType('Case')
    case_type.set_field('timesheet', resolve_case_timesheet)
    case_type.set_field('forecast', resolve_case_forecast)
    
    active_deal_type = ObjectType('ActiveDeal')
    active_deal_type.set_field('client', resolve_active_deal_client)
    active_deal_type.set_field('accountManager', resolve_active_deal_account_manager)
    active_deal_type.set_field('sponsor', resolve_active_deal_sponsor)
    
    return [client_type, account_manager_type, consultant_or_engineer_type, sponsor_type, case_type, active_deal_type]
