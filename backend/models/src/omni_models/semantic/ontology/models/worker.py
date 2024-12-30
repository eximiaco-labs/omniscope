from typing import Dict, List, Optional
from pydantic import BaseModel, HttpUrl
from omni_models.syntactic import Post

class WorkerPost(Post):
    is_account_manager: Optional[bool] = False
    is_active: Optional[bool] = True
    is_squad_leader: Optional[bool] = False
    is_squad_member: Optional[bool] = False
    is_squad_mentor: Optional[bool] = False
    is_squad_trainee: Optional[bool] = False
    is_squad_intern: Optional[bool] = False
    is_squad_apprentice: Optional[bool] = False
    is_squad_junior: Optional[bool] = False
    is_squad_mid: Optional[bool] = False
    is_squad_senior: Optional[bool] = False
    is_squad_specialist: Optional[bool] = False
    is_squad_tech_lead: Optional[bool] = False
    is_squad_tech_manager: Optional[bool] = False
    is_squad_tech_director: Optional[bool] = False
    is_squad_tech_advisor: Optional[bool] = False
    is_squad_tech_consultant: Optional[bool] = False
    is_squad_tech_architect: Optional[bool] = False
    is_squad_tech_specialist: Optional[bool] = False
    is_squad_tech_expert: Optional[bool] = False
    is_squad_tech_master: Optional[bool] = False
    is_squad_tech_guru: Optional[bool] = False
    is_squad_tech_wizard: Optional[bool] = False
    is_squad_tech_ninja: Optional[bool] = False
    is_squad_tech_rockstar: Optional[bool] = False
    is_squad_tech_superhero: Optional[bool] = False
    is_squad_tech_unicorn: Optional[bool] = False
    is_squad_tech_jedi: Optional[bool] = False
    is_squad_tech_master_jedi: Optional[bool] = False
    is_squad_tech_yoda: Optional[bool] = False

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

        # Obtém a lista de atividades do campo meta ou acf
        atividades = post.meta.get('atividade', []) if post.meta else []
        if isinstance(atividades, str):
            atividades = [int(atividades)]
        elif isinstance(atividades, list):
            atividades = [int(a) for a in atividades if a]

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
            is_account_manager=28 in atividades,
            clients=worker_client_rels.get(post.id, [])
        )