from .models import Offer
from core.generator import generate_schema

types = [Offer]
schema = generate_schema(types, "MarketingAndSales", include_base_types=False)

__all__ = ['schema']