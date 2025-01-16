from typing import Optional, List
from pydantic import BaseModel, Field
from core.fields import Id
from datetime import datetime, date


class Case(BaseModel):
    id: str = Id(description="The unique identifier of the case")
    slug: str = Field(..., description="URL-friendly identifier of the case")
    title: str = Field(..., description="The title of the case")
    is_active: bool = Field(..., description="Whether the case is currently active")
    pre_contracted_value: bool = Field(False, description="Whether this case has a pre-contracted value")
    
    client_id: Optional[int] = Field(None, description="The ID of the associated client")
    everhour_projects_ids: List[str] = Field(default_factory=list, description="List of associated Everhour project IDs")
    ontology_url: Optional[str] = Field(None, description="The URL of the ontology entry for this case")
    omni_url: str = Field(..., description="The URL of the case's page in the Omni system")
    
    start_of_contract: Optional[date] = Field(None, description="The start date of the contract")
    end_of_contract: Optional[date] = Field(None, description="The end date of the contract")
    weekly_approved_hours: Optional[float] = Field(None, description="The number of approved hours per week")
    fixed_fee: Optional[float] = Field(None, description="The fixed fee amount for this case")
    
    status: Optional[str] = Field(None, description="The current status of the case")
    last_updated: Optional[datetime] = Field(None, description="The timestamp of the last update")
    sponsor_name: Optional[str] = Field(None, description="The name of the case sponsor")
    offers_ids: List[int] = Field(default_factory=list, description="List of associated offer IDs")
    deals_ids: List[int] = Field(default_factory=list, description="List of associated deal IDs")

    @classmethod
    def from_domain(cls, domain_case):
        """Convert a domain Case instance to a Case model instance"""
        return cls(
            id=domain_case.id,
            slug=domain_case.slug,
            title=domain_case.title,
            is_active=domain_case.is_active,
            pre_contracted_value=domain_case.pre_contracted_value,
            client_id=domain_case.client_id,
            everhour_projects_ids=domain_case.everhour_projects_ids,
            ontology_url=str(domain_case.ontology_url) if domain_case.ontology_url else None,
            omni_url=f'/cases/{domain_case.slug}',
            start_of_contract=domain_case.start_of_contract,
            end_of_contract=domain_case.end_of_contract,
            weekly_approved_hours=domain_case.weekly_approved_hours,
            fixed_fee=domain_case.fixed_fee,
            status=domain_case.status,
            last_updated=domain_case.last_updated,
            sponsor_name=domain_case.sponsor,
            offers_ids=domain_case.offers_ids,
            deals_ids=[deal.id for deal in domain_case.deals]
        ) 