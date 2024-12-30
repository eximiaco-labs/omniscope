import re
from typing import List, Optional, Dict
from datetime import datetime, date
from pydantic import BaseModel, HttpUrl

from omni_models.syntactic import Post, EventDetail

class Case(BaseModel):
    id: int
    title: str
    slug: str
    link: HttpUrl
    offers: List[int]
    is_active: bool
    pre_contracted_value: bool
    everhour_projects_ids: Optional[str] = None
    
    start_of_contract: Optional[date] = None
    end_of_contract: Optional[date] = None
    weekly_approved_hours: Optional[float] = None

    client_id: Optional[int] = None
    last_update_gmt: datetime
    updates: Optional[List[EventDetail]] = None
    sponsor: Optional[str] = None

    @property
    def is_missing_offer(self):
        return len(self.offers) == 0

    @staticmethod
    def from_wordpress_post(
            post: Post,
            offers: Dict[int, List[int]],
            clients: Dict[int, List[int]]
    ) -> 'Case':
        clients = clients.get(post.id, [])
        if len(clients) > 0:
            client_id = clients[0]
        else:
            client_id = None

        allocation = post.meta.get('alocacao-semanal-em-horas', '0')
        allocation = allocation.strip().replace(',', '.')
        match = re.match(r'^(\d+(?:\.\d+)?)', allocation)
        allocation = match.group(1) if match else '0'

        pre_contracted_value = post.meta.get('valor-pre-contratado', {})
        if isinstance(pre_contracted_value, list):
            pre_contracted_value = False
        else:
            pre_contracted_value = pre_contracted_value.get('Valor pré-contratado', 'false') != 'false'

        return Case(
            id=post.id,
            title=post.title.rendered,
            slug=post.slug,
            link=post.link,
            is_active=post.meta.get('status', None) == 'Em andamento',
            pre_contracted_value = pre_contracted_value,
            everhour_projects_ids=post.meta.get('codigo-do-projeto', None),
            sponsor=post.meta.get('sponsor', None),
            start_of_contract=datetime.strptime(post.meta.get('inicio-do-contrato'), '%Y-%m-%d').date() if post.meta.get('inicio-do-contrato') and post.meta.get('inicio-do-contrato').strip() else None,
            end_of_contract=datetime.strptime(post.meta.get('fim-do-contrato'), '%Y-%m-%d').date() if post.meta.get('fim-do-contrato') and post.meta.get('fim-do-contrato').strip() else None,
            weekly_approved_hours=float(allocation) if allocation else None,
            offers=offers.get(post.id, []),
            client_id=client_id,
            last_update_gmt=post.modified_gmt,
            updates=post.acf.updates if post.acf else None,
        )