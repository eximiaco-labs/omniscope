import re

from settings import api_settings
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Optional, Dict

import validators
from pydantic import BaseModel, HttpUrl

from models.base.semanticmodel import SemanticModel
from models.syntactic import Wordpress, Post, User, EventDetail

from decorators import c4_external_system


class Class(BaseModel):
    slug: str
    name: str
    description: str


class WorkerPost(Post):
    atividade: list[int]


class Worker(BaseModel):
    id: int
    name: str
    photo_url: Optional[HttpUrl] = None
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
            slug=post.slug,
            link=post.link,
            profile=post.content.rendered,
            has_profile=(post.content.rendered is not None) and len(post.content.rendered) > 0,
            is_account_manager=28 in post.atividade,
            clients=worker_client_rels.get(post.id, [])
        )


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


class Case(BaseModel):
    id: int
    title: str
    slug: str
    link: HttpUrl
    offers: List[int]
    is_active: bool
    everhour_projects_ids: Optional[str] = None
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

        return Case(
            id=post.id,
            title=post.title.rendered,
            slug=post.slug,
            link=post.link,
            is_active=post.meta.get('status', None) == 'Em andamento',
            everhour_projects_ids=post.meta.get('codigo-do-projeto', None),
            sponsor=post.meta.get('sponsor', None),
            offers=offers.get(post.id, []),
            client_id=client_id,
            last_update_gmt=post.modified_gmt,
            updates=post.acf.updates if post.acf else None,
        )


class Entry(BaseModel):
    id: int
    title: str
    link: HttpUrl
    class_name: str
    author_id: int
    author_name: str
    creation_date: datetime
    creation_week: str
    cover_image_url: Optional[str] = None

    @staticmethod
    def from_wordpress_post(post: Post, class_name: str, author: User) -> 'Entry':
        default_cover_image_url = '/assets/who_is_it.jpeg'
        cover_image_url = default_cover_image_url
        yoast_head_json = post.yoast_head_json
        if isinstance(yoast_head_json, dict):
            og_image = yoast_head_json.get('og_image', [])
            if og_image and 'url' in og_image[0]:
                potential_cover_image_url = og_image[0]['url']
                cover_image_url = potential_cover_image_url if potential_cover_image_url else default_cover_image_url

        return Entry(
            id=post.id,
            title=post.title.rendered,
            link=post.link,
            class_name=class_name,
            author_id=author.id,
            author_name=author.name,
            creation_date=post.date_gmt,
            creation_week=post.creation_week,
            cover_image_url=cover_image_url
        )


@c4_external_system(
    "Ontology (Wordpress)",
    "Serves as the company's knowledge base, covering concepts, frameworks, clients, and more"
)
class Ontology(SemanticModel):
    def __init__(self, wordpress=None):
        wordpress_user = api_settings["wordpress_user"]
        wordpress_pass = api_settings["wordpress_pass"]

        self.wp = wordpress or Wordpress(
            'https://ontologia.eximia.co',
            wordpress_user,
            wordpress_pass
        )

    @property
    def classes(self) -> List[Class]:
        post_types = self.wp.fetch_post_types()

        pattern = re.compile(
            r'^(?:wp_|nav_)|cases-|feedzy_|jet-engine|assets|classes|page|post|links|media|attachment|visibility_preset|_links$|-links$'
        )

        return [
            Class(slug=post_type.slug, name=post_type.name, description=post_type.description)
            for post_type in post_types
            if not pattern.search(post_type.slug) and not post_type.slug.startswith('ofertas-')
        ]

    @property
    def authors(self) -> Dict[int, User]:
        return self.wp.fetch_users()

    @property
    def workers(self) -> Dict[int, Worker]:
        posts = self.wp.fetch_posts('consultores', cls=WorkerPost)
        relations = self.worker_clients_relations
        return {post.id: Worker.from_wordpress_post(post, relations) for post in posts}

    @property
    def account_managers(self) -> Dict[int, Worker]:
        workers = self.workers.values()
        return {
            worker.id: worker
            for worker in workers
            if worker.is_account_manager
        }

    @property
    def consultants_or_engineers(self) -> Dict[int, Worker]:
        workers = self.workers.values()
        return {
            worker.id: worker
            for worker in workers
            if not worker.is_account_manager
        }

    @property
    def worker_clients_relations(self):
        return self.wp.fetch_jet_relations(37)

    @property
    def clients_cases_relations(self):
        return self.wp.fetch_jet_relations(34)

    @property
    def cases_clients_relations(self):
        clients_cases = self.clients_cases_relations
        result = {}

        for client_id, cases_ids in clients_cases.items():
            for case_id in cases_ids:
                if case_id not in result:
                    result[case_id] = []
                result[case_id].append(client_id)

        return result

    @property
    def clients(self):
        posts = self.wp.fetch_posts('clientes')

        return {
            post.id: Client.from_wordpress_post(post, self)
            for post in posts
        }

    @property
    def offers_cases_relations(self) -> Dict[int, list[int]]:
        return self.wp.fetch_jet_relations(44)

    @property
    def cases_offers_relations(self) -> Dict[int, list[int]]:
        offers_cases = self.offers_cases_relations
        result = {}

        for offer_id, case_ids in offers_cases.items():
            for case_id in case_ids:
                if case_id not in result:
                    result[case_id] = []
                result[case_id].append(offer_id)

        return result

    @property
    def cases(self) -> Dict[int, Case]:
        cases_offers = self.cases_offers_relations
        cases_clients = self.cases_clients_relations
        posts = self.wp.fetch_posts('cases')
        return {
            post.id: Case.from_wordpress_post(post, cases_offers, cases_clients)
            for post in posts
        }

    @property
    def offers(self) -> Dict[int, Entry]:
        posts = self.wp.fetch_posts('ofertas')
        authors = self.authors
        return {
            post.id: Entry.from_wordpress_post(post, 'ofertas', authors[post.author])
            for post in posts
        }

    def fetch_entries(self, after: datetime, before: datetime) -> List[Entry]:
        classes = self.classes
        authors = self.authors

        def fetch_posts(cls: Class):
            posts = self.wp.fetch_posts(cls.slug, after, before)

            return [
                Entry.from_wordpress_post(post, cls.name, authors[post.author])
                for post in posts
            ]

        future_to_row = {}
        with ThreadPoolExecutor(max_workers=10) as executor:  # Adjust max_workers based on your environment
            # Submit tasks to the executor
            futures = [executor.submit(fetch_posts, cls) for cls in classes]
            for future in futures:
                future_to_row[future] = future

        result = []
        for future in as_completed(future_to_row):
            entries = future.result()
            if len(entries):
                result += entries

        return result
