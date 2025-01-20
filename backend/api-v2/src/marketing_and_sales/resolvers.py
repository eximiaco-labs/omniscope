from ariadne import QueryType, ObjectType
from .models import Offer
from core.decorators import collection
from omni_shared import globals

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





