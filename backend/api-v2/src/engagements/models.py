from typing import Optional, List
from omni_models.analytics.timeliness_review import compute_timeliness_review
from pydantic import BaseModel, Field
from core.fields import Id
from timesheet.models import Timesheet
from team.models import ConsultantOrEngineer
from datetime import datetime, date
from .summaries.models import Timeliness, Staleliness, Allocation
from core.decorators import namespace
from core.generator import FilterableField

from omni_shared import globals

class Sponsor(BaseModel):
    slug: str = Id(description="URL-friendly identifier of the sponsor")
    name: str = Field(..., description="The full name of the sponsor")
    photo_url: str = Field("/images/who_is_it.jpeg", description="The URL of the sponsor's photo")
    client_id: Optional[int] = Field(None, description="The ID of the associated client")
    job_title: Optional[str] = Field(None, description="The job title of the sponsor")
    linkedin_url: Optional[str] = Field(None, description="The URL of the sponsor's LinkedIn profile")
    timesheet: Optional[Timesheet] = None

    @classmethod
    def from_domain(cls, domain_sponsor):
        """Convert a domain Sponsor instance to a Sponsor model instance"""
        
        if not domain_sponsor:
            return None
        
        return cls(
            slug=domain_sponsor.slug,
            name=domain_sponsor.name,
            photo_url=str(domain_sponsor.photo_url) if domain_sponsor.photo_url else "/images/who_is_it.jpeg",
            client_id=domain_sponsor.client_id,
            crm_id=domain_sponsor.crm_id,
            job_title=domain_sponsor.job_title,
            linkedin_url=str(domain_sponsor.linkedin_url) if domain_sponsor.linkedin_url else None
        )
        
class CaseUpdate(BaseModel):
    date: Optional[datetime]
    author: Optional[str]
    status: str
    observations: str
    
class Case(BaseModel):
    id: str = Id(description="The unique identifier of the case")
    slug: str = Id(description="URL-friendly identifier of the case")
    title: str = Field(..., description="The title of the case")
    is_active: bool = Field(..., description="Whether the case is currently active")
    pre_contracted_value: bool = Field(False, description="Whether this case has a pre-contracted value")
    
    client_id: Optional[int] = Field(None, description="The ID of the associated client")
    everhour_projects_ids: List[str] = Field(default_factory=list, description="List of associated Everhour project IDs")
    ontology_url: Optional[str] = Field(None, description="The URL of the ontology entry for this case")
    
    has_description: bool = Field(False, description="Whether this case has a description on ontology")
    is_stale: bool = Field(False, description="Whether this case is stale")
    start_of_contract: Optional[date] = None
    end_of_contract: Optional[date] = None
    weekly_approved_hours: Optional[float] = Field(None, description="The number of approved hours per week")
    fixed_fee: Optional[float] = Field(None, description="The fixed fee amount for this case")
    
    status: Optional[str] = Field(None, description="The current status of the case")
    last_updated: Optional[datetime] = Field(None, description="The timestamp of the last update")
    sponsor: Optional[Sponsor] = None
    offers_ids: List[int] = Field(default_factory=list, description="List of associated offer IDs")
    deals_ids: List[int] = Field(default_factory=list, description="List of associated deal IDs")
    
    updates: Optional[List[CaseUpdate]] = None
    last_update: Optional[CaseUpdate] = None
    
    timesheet: Optional[Timesheet] = None

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
            sponsor=Sponsor.from_domain(globals.omni_models.sponsors.get_by_name(domain_case.sponsor)),
            offers_ids=domain_case.offers_ids,
            deals_ids=[deal.id for deal in domain_case.deals],
            has_description=domain_case.has_description,
            is_stale=domain_case.is_stale,
            updates=[ u.model_dump() for u in domain_case.updates ] if domain_case.updates else None,  
            last_update=domain_case.last_update.model_dump() if domain_case.last_update else None
            
        )


class Client(BaseModel):
    id: int = Id(description="The unique identifier of the client")
    slug: str = Id(description="URL-friendly identifier of the client")
    name: str = Field(..., description="The full name of the client")
    is_strategic: bool = Field(..., description="Whether this is a strategic client")
    everhour_clients_ids: List[int] = Field(default_factory=list, description="List of associated Everhour client IDs")
    is_recognized: bool = Field(..., description="Whether the client is recognized in the system")
    ontology_url: Optional[str] = Field(None, description="The URL of the ontology entry for this client")
    logo_url: str = Field("/assets/who_is_it.jpeg", description="The URL of the client's logo")
    account_manager_id: Optional[int] = Field(None, description="The ID of the assigned account manager")
    
    timesheet: Optional[Timesheet] = None
    active_cases: Optional[List[Case]] = None

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




class Project(BaseModel):
    id: str = Id(description="The unique identifier of the project")
    slug: str = Id(description="URL-friendly identifier of the project")
    name: str = Field(..., description="The name of the project")
    status: str = Field(..., description="The current status of the project")
    client_id: Optional[int] = Field(None, description="The ID of the associated client")
    due_on: Optional[datetime] = Field(None, description="The due date of the project")
    
    is_squad: bool = Field(False, description="Whether this is a squad project")
    is_eximiaco: bool = Field(False, description="Whether this is an internal Eximia project")
    is_handson: bool = Field(False, description="Whether this is a hands-on project")
    kind: str = Field(..., description="The type of project (handsOn, squad, internal, or consulting)")
    
    billing_type: Optional[str] = Field(None, description="The type of billing for this project")
    billing_fee: Optional[float] = Field(None, description="The billing fee amount")
    
    @classmethod
    def from_domain(cls, domain_project):
        """Convert a domain Project instance to a Project model instance"""
        return cls(
            id=domain_project.id,
            name=domain_project.name,
            slug=domain_project.slug,
            status=domain_project.status,
            client_id=domain_project.client_id,
            due_on=domain_project.due_on,
            is_squad=domain_project.is_squad,
            is_eximiaco=domain_project.is_eximiaco,
            is_handson=domain_project.is_handson,
            kind=domain_project.kind,
            billing_type=domain_project.billing.type if domain_project.billing else None,
            billing_fee=domain_project.billing.fee if domain_project.billing else None
        )


@namespace
class Summaries(BaseModel):
    def timeliness(self, date_of_interest: date, filters: Optional[List[FilterableField]] = None) -> Timeliness:
        result = compute_timeliness_review(date_of_interest, filters)
        return Timeliness.from_model(result)
    
    def staleliness(self, workerSlug: str = None) -> Staleliness:
        from .summaries.services import compute_staleliness
        return compute_staleliness(workerSlug)
    
    def allocation(self, start_date: date, end_date: date, filters: Optional[List[FilterableField]] = None) -> Allocation:
        from .summaries.services import compute_allocation
        return compute_allocation(start_date, end_date, filters)
        
__all__ = [
    'Client',
    'Sponsor',
    'Case',
    'Project',
    'Summaries'
] 