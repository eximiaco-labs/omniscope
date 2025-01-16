from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from core.fields import Id


class Project(BaseModel):
    id: str = Id(description="The unique identifier of the project")
    name: str = Field(..., description="The name of the project")
    slug: str = Field(..., description="URL-friendly identifier of the project")
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