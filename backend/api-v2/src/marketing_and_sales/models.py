from pydantic import BaseModel, Field
from typing import Optional
from core.fields import Id
from timesheet.models import Timesheet

from datetime import datetime

class Offer(BaseModel):
    id: int = Id(description="The unique identifier of the offer")
    slug: str = Id(description="The URL-friendly identifier of the offer")
    name: str = Field(..., description="The name of the offer")
    cover_image_url: Optional[str] = '/assets/who_is_it.jpeg'
    
    timesheet: Optional[Timesheet] = None
    
    @classmethod
    def from_domain(cls, domain_offer):
        return cls(
            id=domain_offer.id,
            slug=domain_offer.slug,
            name=domain_offer.name,
            cover_image_url=domain_offer.cover_image_url
        )
        
        
class ActiveDeal(BaseModel):
    id: int = Id(description="The unique identifier of the active deal")
    title: str = Field(..., description="The title of the active deal")
    # stage_id: int = Field(..., description="The unique identifier of the stage of the active deal")
    stage_name: str = Field(..., description="The name of the stage of the active deal")
    stage_order_nr: int = Field(..., description="The order number of the stage of the active deal")
    probability: Optional[float] = None
    client_or_prospect_name: Optional[str] = None
    account_manager_name: Optional[str] = None
    sponsor_name: Optional[str] = None
    add_time: Optional[datetime]
    won_time: Optional[datetime] = None
    update_time: Optional[datetime]
    days_since_last_update: Optional[int] = 0
    #everhour_id: Optional[str] = None
    status: Optional[str] = "open"
    
    @classmethod
    def from_domain(cls, domain_active_deal):
        return cls(
            id=domain_active_deal.id,
            title=domain_active_deal.title,
            # stage_id=domain_active_deal.stage_id,
            stage_name=domain_active_deal.stage_name,
            stage_order_nr=domain_active_deal.stage_order_nr,
            probability=domain_active_deal.probability,
            client_or_prospect_name=domain_active_deal.client_or_prospect_name,
            account_manager_name=domain_active_deal.account_manager_name,
            sponsor_name=domain_active_deal.sponsor_name,
            add_time=domain_active_deal.add_time,
            won_time=domain_active_deal.won_time,
            update_time=domain_active_deal.update_time,
            days_since_last_update=domain_active_deal.days_since_last_update,
            # everhour_id=domain_active_deal.everhour_id,
            status=domain_active_deal.status
        )
