from datetime import datetime
from typing import Optional

from omni_models.syntactic import Client
import omni_models.syntactic.everhour as e

class Project(e.Project):
    due_on: Optional[datetime] = None
    
    is_squad: Optional[bool] = False
    is_eximiaco: Optional[bool] = False
    is_handson: Optional[bool] = False
    
    @property
    def kind(self):
        if self.is_handson:
            return 'handsOn'
        if self.is_squad:
            return 'squad'
        if self.is_eximiaco:
            return 'internal'
        
        return 'consulting'

    @classmethod
    def from_base_instance(cls, base_instance: e.Project, client: Client):
        base_dict = base_instance.dict()
        base_dict['is_squad'] = client.is_squad if client else False
        base_dict['is_eximiaco'] = client.is_eximiaco if client else True
        base_dict['is_handson'] = client.is_handson if client else False

        if base_instance.name.lower().endswith('- se'):
            base_dict['is_handson'] = True

        if base_dict['is_handson']:
            base_dict['is_squad'] = False
            base_dict['is_eximiaco'] = False

        return cls(**base_dict) 