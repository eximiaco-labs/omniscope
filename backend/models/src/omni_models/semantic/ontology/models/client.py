from typing import Optional
from pydantic import BaseModel, HttpUrl
import validators

from omni_models.syntactic import Post

class Client(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[HttpUrl] = None
    link: HttpUrl
    profile: str
    has_profile: bool
    is_strategic: bool
    everhour_clients_ids: Optional[str]
    account_manager_id: Optional[int] = None

    @property
    def omni_url(self):
        return f'clients/{self.slug}'

    @staticmethod
    def from_wordpress_post(post: Post, ontology) -> 'Client':
        logo_url = post.meta.get('logo', None)

        meta_cliente_estrategico = post.meta.get('cliente-estrategico', {})
        if not isinstance(meta_cliente_estrategico, dict):
            meta_cliente_estrategico = {}
        is_strategic = meta_cliente_estrategico.get('Sim', 'false') == 'true'

        if logo_url and logo_url != '' and not validators.url(logo_url):
            logo_url = ontology.wp.fetch_media_url(logo_url)

        managers = ontology.account_managers

        result = Client(
            id=post.id,
            name=post.title.rendered,
            logo_url=logo_url if validators.url(logo_url) else None,
            slug=post.slug,
            link=post.link,
            profile=post.content.rendered,
            everhour_clients_ids=post.meta.get('codigo-do-cliente', None),
            has_profile=(post.content.rendered is not None) and len(post.content.rendered) > 0,
            is_strategic=is_strategic,
        )

        for _, manager in managers.items():
            if post.id in manager.clients:
                result.account_manager_id = manager.id
                break

        return result