from .models import Offer
from core.generator import generate_schema

def init():
    types = [Offer]
    schema = generate_schema(types, "MarketingAndSales", include_base_types=False)
    return schema
