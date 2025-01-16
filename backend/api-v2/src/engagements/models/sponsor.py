from typing import Optional
from pydantic import BaseModel, Field
from core.fields import Id


class Sponsor(BaseModel):
    id: int = Id(description="The unique identifier of the sponsor")
    slug: str = Field(..., description="URL-friendly identifier of the sponsor")
    name: str = Field(..., description="The full name of the sponsor")
    photo_url: str = Field("/images/who_is_it.jpeg", description="The URL of the sponsor's photo")
    client_id: Optional[int] = Field(None, description="The ID of the associated client")
    crm_id: Optional[str] = Field(None, description="The ID of the sponsor in the CRM system")
    job_title: Optional[str] = Field(None, description="The job title of the sponsor")
    linkedin_url: Optional[str] = Field(None, description="The URL of the sponsor's LinkedIn profile")

    @classmethod
    def from_domain(cls, domain_sponsor):
        """Convert a domain Sponsor instance to a Sponsor model instance"""
        return cls(
            id=domain_sponsor.id,
            slug=domain_sponsor.slug,
            name=domain_sponsor.name,
            photo_url=str(domain_sponsor.photo_url) if domain_sponsor.photo_url else "/images/who_is_it.jpeg",
            client_id=domain_sponsor.client_id,
            crm_id=domain_sponsor.crm_id,
            job_title=domain_sponsor.job_title,
            linkedin_url=str(domain_sponsor.linkedin_url) if domain_sponsor.linkedin_url else None
        )