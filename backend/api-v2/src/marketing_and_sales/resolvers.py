from ariadne import QueryType, ObjectType
from .models import Offer
from core.decorators import collection
from omni_shared import globals

from timesheet.resolvers import compute_timesheet, build_fields_map

query = QueryType()
offer = ObjectType("Offer")
marketing_and_sales = ObjectType("MarketingAndSales")
marketing_and_sales_resolvers = [query, offer, marketing_and_sales]

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




