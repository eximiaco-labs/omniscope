from ariadne import QueryType, ObjectType

from .user import resolve_user
from .account_managers import resolve_account_managers, resolve_account_manager
from .consultants_engineers import resolve_consultants_and_engineers, resolve_consultant_or_engineer
from .clients import resolve_client_timesheet, resolve_clients, resolve_client
from .sponsors import resolve_sponsors, resolve_sponsor
from .cases import resolve_cases, resolve_case
from .offers import resolve_offers, resolve_offer
from .projects import resolve_projects
from .active_deals import resolve_active_deals, resolve_active_deal

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

    return [client_type]
