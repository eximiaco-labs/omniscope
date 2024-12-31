from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

from omni_models.semantic import SalesFunnelB2B

class ActiveDeal(BaseModel):
    id: int
    title: str
    stage_id: int 
    stage_name: str
    stage_order_nr: int
    client_or_prospect_name: Optional[str] = None
    account_manager_name: Optional[str] = None
    sponsor_name: Optional[str] = None
    add_time: Optional[datetime]
    won_time: Optional[datetime] = None
    update_time: Optional[datetime]
    days_since_last_update: Optional[int] = 0
    everhour_id: Optional[str] = None
    status: Optional[str] = "open"
    
class ActiveDealsRepository:
    def __init__(self, salesfunnel: SalesFunnelB2B):
        self.salesfunnel = salesfunnel
        self.__data = None
        self.__won_deals = None
        self.__active_deals = None

    def get_all(self) -> List[ActiveDeal]:
        if self.__data is None:
            self.__build_data()
        return self.__data

    def get_by_id(self, id: int) -> Optional[ActiveDeal]:
        if self.__data is None:
            self.__build_data()
        return next((deal for deal in self.__data if deal.id == id), None)
    
    def get_by_everhour_id(self, everhour_id: str) -> Optional[ActiveDeal]:
        if self.__data is None:
            self.__build_data()
        return next((deal for deal in self.__data if deal.everhour_id == everhour_id), None)

    def __create_active_deal(self, deal) -> ActiveDeal:
        return ActiveDeal(**deal.model_dump())

    def __build_data(self):
        self.__active_deals = [
            self.__create_active_deal(deal)
            for deal in self.salesfunnel.active_deals
        ]
        
        self.__won_deals = [
            self.__create_active_deal(deal) 
            for deal in self.salesfunnel.won_deals
        ]

        self.__data = self.__active_deals + self.__won_deals