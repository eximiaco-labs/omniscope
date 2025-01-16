from typing import Optional, List
from pydantic import BaseModel, Field
from core.fields import Id


class Client(BaseModel):
    id: int = Id(description="The unique identifier of the client")
    slug: str = Field(..., description="URL-friendly identifier of the client")
    name: str = Field(..., description="The full name of the client")
    is_strategic: bool = Field(..., description="Whether this is a strategic client")
    everhour_clients_ids: List[int] = Field(default_factory=list, description="List of associated Everhour client IDs")
    is_recognized: bool = Field(..., description="Whether the client is recognized in the system")
    ontology_url: Optional[str] = Field(None, description="The URL of the ontology entry for this client")
    logo_url: str = Field("/assets/who_is_it.jpeg", description="The URL of the client's logo")
    omni_url: str = Field(..., description="The URL of the client's page in the Omni system")
    account_manager_id: Optional[int] = Field(None, description="The ID of the assigned account manager")

    @classmethod
    def from_domain(cls, domain_client):
        """Convert a domain Client instance to a Client model instance"""
        return cls(
            id=domain_client.id,
            slug=domain_client.slug,
            name=domain_client.name,
            is_strategic=domain_client.is_strategic,
            everhour_clients_ids=domain_client.everhour_clients_ids,
            is_recognized=domain_client.is_recognized,
            ontology_url=str(domain_client.ontology_url) if domain_client.ontology_url else None,
            logo_url=str(domain_client.logo_url) if domain_client.logo_url else "/assets/who_is_it.jpeg",
            omni_url=f'/clients/{domain_client.slug}',
            account_manager_id=domain_client.account_manager.id if domain_client.account_manager else None
        ) 