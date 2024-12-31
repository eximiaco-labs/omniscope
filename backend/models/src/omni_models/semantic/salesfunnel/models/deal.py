from pydantic import BaseModel, computed_field, model_validator
from typing import Optional, Any
from datetime import datetime

class Deal(BaseModel):
    id: int
    title: str
    stage_id: int
    stage_name: str
    stage_order_nr: int
    client_name: Optional[str]
    account_manager_id: int
    account_manager_name: str
    add_time: Optional[datetime]
    update_time: Optional[datetime]
    everhour_id: Optional[str] = None

    @computed_field
    def days_since_last_update(self) -> int:
        if not self.update_time:
            return 0
        return (datetime.now() - self.update_time).days

    @model_validator(mode='before')
    @classmethod
    def convert_from_pipedrive(cls, data: dict[str, Any]) -> dict[str, Any]:
        if hasattr(data, 'model_dump'):
            data = data.model_dump()
            
        # Extrai informações do stage se presente
        if 'stage' in data:
            stage = data.pop('stage')
            data['stage_id'] = stage.id
            data['stage_name'] = stage.name
            data['stage_order_nr'] = stage.order_nr
            
        # Conversão do user_id do Pipedrive
        if 'user_id' in data:
            user = data.pop('user_id')
            data['account_manager_id'] = user.get('id')
            data['account_manager_name'] = user.get('name')
            
        # Conversão do org_id do Pipedrive
        if 'org_id' in data:
            org = data.pop('org_id')
            data['client_name'] = org.get('name') if org else None

        return data