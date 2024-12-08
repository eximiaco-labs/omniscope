from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

from omni_models.semantic import SalesFunnelB2B
from omni_models.domain import Worker, Client

class ActiveDeal(BaseModel):
    id: int
    title: str
    stage_id: int 
    stage_name: str
    stage_order_nr: int
    client_or_prospect_name: str
    client: Optional[Client] = None
    account_manager: Optional[Worker] = None
    add_time: Optional[datetime]
    update_time: Optional[datetime]
    days_since_last_update: Optional[int] = 0


class ActiveDealsRepository:
    def __init__(self, salesfunnel: SalesFunnelB2B, clients_repository, workers_repository):
        self.clients_repository = clients_repository
        self.workers_repository = workers_repository
        self.salesfunnel = salesfunnel
        self.__data = None

    def get_all(self) -> List[ActiveDeal]:
        if self.__data is None:
            self.__build_data()
        
        return self.__data

    def get_by_id(self, id: int) -> Optional[ActiveDeal]:
        if self.__data is None:
            self.__build_data()

        return next((deal for deal in self.__data if deal.id == id), None)

    def __build_data(self):
        self.__data = [
            ActiveDeal(
                id=deal.id,
                title=deal.title,
                stage_id=deal.stage_id,
                stage_name=deal.stage_name,
                stage_order_nr=deal.stage_order_nr,
                client_or_prospect_name=deal.client_name,
                client=self.clients_repository.get_by_name(deal.client_name),
                account_manager=self.workers_repository.get_by_name(deal.account_manager_name),
                add_time=deal.add_time,
                update_time=deal.update_time,
                days_since_last_update=deal.days_since_last_update
            )
            for deal in self.salesfunnel.active_deals
        ]