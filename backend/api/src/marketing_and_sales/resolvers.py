from ariadne import QueryType, ObjectType
from .models import Offer, ActiveDeal
from core.decorators import collection
from omni_shared import globals

from engagements.models import Client

from timesheet.resolvers import compute_timesheet, build_fields_map

query = QueryType()
offer = ObjectType("Offer")
active_deal = ObjectType("ActiveDeal")
marketing_and_sales = ObjectType("MarketingAndSales")
marketing_and_sales_resolvers = [query, offer, active_deal, marketing_and_sales]

@query.field("marketingAndSales")
def resolve_marketing_and_sales(*_):
    return {}

@marketing_and_sales.field("offers")
@collection
def resolve_marketing_and_sales_offers(obj, info):
    return [
        Offer.from_domain(offer)
        for offer in globals.omni_models.products_or_services.get_all().values()
    ]

@marketing_and_sales.field("offer")
def resolve_marketing_and_sales_offer(obj, info, id=None, slug=None):
    if id:
        offer = globals.omni_models.products_or_services.get_by_id(id)
    elif slug:
        offer = globals.omni_models.products_or_services.get_by_slug(slug)
    else:
        raise Exception("Offer not found")
    
    if not offer:
        raise Exception("Offer not found")
    
    return Offer.from_domain(offer)

@marketing_and_sales.field("activeDeals")
@collection
def resolve_marketing_and_sales_active_deals(obj, info):
    return [
        ActiveDeal.from_domain(active_deal)
        for active_deal in globals.omni_models.active_deals.get_all()
    ]

@offer.field("timesheet")
def resolve_offer_timesheet(obj, info, slug: str = None, filters = None):
    if filters is None:
        filters = []
        
    client_filters = [
        {
            'field': 'ProductsOrServices',
            'selected_values': [obj['name']]
        }
    ] + filters
    
    map = build_fields_map(info)
    result = compute_timesheet(map, slug, client_filters)
    model_dump = result.model_dump()
    print(model_dump)
    return model_dump

@active_deal.field("client")
def resolve_active_deal_client(obj, info):
    client = globals.omni_models.clients.get_by_name(obj['client_or_prospect_name'])
    if not client:
        return None
    
    return Client.from_domain(client)






