import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Dict

from omni_shared.settings import api_settings
from omni_utils.decorators.cache import memoize
from omni_utils.decorators.c4 import c4_external_system

from omni_models.base.semanticmodel import SemanticModel
from omni_models.syntactic import Wordpress, Post, User

from .models import Class, Worker, Client, Case, Entry, WorkerPost

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
        def fetch_workers():
            posts = self.wp.fetch_posts('consultores', cls=WorkerPost)
            relations = self.worker_clients_relations
            return {post.id: Worker.from_wordpress_post(post, relations) for post in posts}
        return memoize('workers', fetch_workers)
    
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
        def fetch_clients():
            posts = self.wp.fetch_posts('clientes')
            return {
                post.id: Client.from_wordpress_post(post, self)
                for post in posts
            }
        return memoize('clients', fetch_clients)

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
        def fetch_cases():
            cases_offers = self.cases_offers_relations
            cases_clients = self.cases_clients_relations
            posts = self.wp.fetch_posts('cases')
            return {
                post.id: Case.from_wordpress_post(post, cases_offers, cases_clients)
                for post in posts
            }
        return memoize('cases', fetch_cases)
    
    @property
    def offers(self) -> Dict[int, Entry]:
        def fetch_offers():
            posts = self.wp.fetch_posts('ofertas')
            authors = self.authors
            return {
                post.id: Entry.from_wordpress_post(post, 'ofertas', authors[post.author])
                for post in posts
            }
        return memoize('offers', fetch_offers)

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