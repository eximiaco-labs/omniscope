from pydantic import BaseModel, Field
from typing import Optional
from core.fields import Id

class Offer(BaseModel):
    id: int = Id(description="The unique identifier of the offer")
    slug: str = Id(description="The URL-friendly identifier of the offer")
    name: str = Field(..., description="The name of the offer")
    cover_image_url: Optional[str] = '/assets/who_is_it.jpeg'
    
    @classmethod
    def from_domain(cls, domain_offer):
        return cls(
            id=domain_offer.id,
            slug=domain_offer.slug,
            name=domain_offer.name,
            cover_image_url=domain_offer.cover_image_url
        )
