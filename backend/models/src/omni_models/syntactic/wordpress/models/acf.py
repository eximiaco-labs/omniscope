from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class EventDetail(BaseModel):
    date: Optional[datetime] = Field(..., alias='data')
    author: Optional[str] = Field(..., alias='autor')
    status: str = Field(..., alias='situacao')
    observations: str = Field(..., alias='observacoes')

    @field_validator('author', mode='before')
    @classmethod
    def set_author_none_if_boolean(cls, v):
        if isinstance(v, bool):
            return None
        return v

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if (v == None):
            return None
        return datetime.strptime(v, '%Y%m%d')

    @field_validator('status', mode='before')
    @classmethod
    def set_status_none(cls, v):
        if v == 'Tudo certo':
            return 'All right'
        elif v == 'Atenção':
            return 'Requires attention'
        elif v == 'Crítico':
            return 'Critical'
        return v

class Acf(BaseModel):
    register_updates: Optional[str] = Field(None, alias='cadastrar_atualizacoes')
    updates: Optional[List[EventDetail]] = Field(..., alias='atualizacoes') 