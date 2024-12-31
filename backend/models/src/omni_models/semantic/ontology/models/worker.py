from typing import Dict, List, Optional
from pydantic import BaseModel, HttpUrl
from omni_models.syntactic import Post

class WorkerPost(Post):
    atividade: List[int]   

class Worker(BaseModel):
    id: int
    name: str
    photo_url: Optional[HttpUrl] = None
    email: Optional[str] = None
    position: str
    slug: str
    link: HttpUrl
    profile: str
    has_profile: bool
    is_account_manager: bool
    clients: List[int]

    @staticmethod
    def from_wordpress_post(post: WorkerPost, worker_client_rels: Dict[int, List[int]]):
        photo_url = post.meta.get('foto', None)
        if photo_url == '':
            photo_url = None

        
        return Worker(
            id=post.id,
            name=post.title.rendered,
            photo_url=photo_url,
            position=post.meta.get('atividade-principal', None),
            email=post.meta.get('e-mail', None),
            slug=post.slug,
            link=post.link,
            profile=post.content.rendered,
            has_profile=(post.content.rendered is not None) and len(post.content.rendered) > 0,
            is_account_manager=28 in post.atividade,
            clients=worker_client_rels.get(post.id, [])
        )