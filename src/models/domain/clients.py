from models.domain.workers import WorkersRepository, Worker
from models.semantic import Ontology, TimeTracker

import models.semantic.ontology as o
import models.syntactic.everhour as t

from pydantic import BaseModel
from typing import Optional, List, Dict
import models.helpers.numbers as numbers


class Client(BaseModel):
    id: int
    slug: str
    name: str
    is_strategic: bool
    everhour_clients_ids: List[int]
    ontology_info: Optional[o.Client] = None
    tracker_info: List[t.Client] = []
    account_manager: Optional[o.Worker] = None

    @property
    def tracker_ids(self):
        return [
            p.id
            for p in self.tracker_info
        ]

    @property
    def is_recognized(self):
        return self.ontology_info is not None

    @property
    def omni_url(self) -> str:
        return f'/clients/{self.slug}'

    @property
    def logo_url(self):
        if self.is_recognized:
            return self.ontology_info.logo_url
        else:
            return '/assets/who_is_it.jpeg'


class ClientsRepository:
    def __init__(self, ontology: Ontology, tracker: TimeTracker, workers_repository: WorkersRepository):
        self.ontology = ontology
        self.tracker = tracker
        self.workers_repository = workers_repository
        self.__data: Dict[int, Client] = None

    def get_all(self) -> Dict[int, Client]:
        if not self.__data:
            self.__build_data()
        return self.__data

    def get_by_id(self, id: int) -> Client:
        if not self.__data:
            self.__build_data()

        attempt1 = self.__data.get(id, None)
        if attempt1 is not None:
            return attempt1

        if numbers.can_convert_to_int(id):
            return self.__data[int(id)]

        raise KeyError(f'No case with id {id}')

    def get_by_slug(self, slug: str) -> Client:
        o_client = next((client for client in self.get_all().values() if client.slug == slug), None)
        return o_client

    def get_by_everhour_id(self, everhour_id: int) -> Client:

        o_client = next(
            (
                client
                for client in self.get_all().values()
                if everhour_id in client.tracker_ids
            ),
            None
        )

        return o_client

    def __build_data(self) -> Dict[int, Client]:
        clients_dict: Dict[str, Client] = {}
        solver = {}
        onto_clients = self.ontology.clients.values()

        for onto_client in onto_clients:

            ids = onto_client.everhour_clients_ids.split(
                ';'
            ) if onto_client.everhour_clients_ids else []

            ids = [int(id) for id in ids if id != '']

            for id in ids:
                solver[id] = onto_client.name.lower()

            new_client = Client(
                id=onto_client.id,
                name=onto_client.name,
                slug=onto_client.slug,
                is_strategic=onto_client.is_strategic,
                ontology_info=onto_client,
                everhour_clients_ids=ids,
            )

            if onto_client.account_manager_id:
                new_client.account_manager = self.workers_repository.get_by_id(
                    onto_client.account_manager_id
                )

            clients_dict[onto_client.name.lower()] = new_client

        neg_id = -1
        tracker_clients = list(self.tracker.all_clients.values())

        for tracker_client in tracker_clients:
            tracker_client_normalized_name = tracker_client.normalized_name
            possible_id = solver.get(tracker_client.id, None)
            if possible_id:
                tracker_client_normalized_name = possible_id

            if tracker_client_normalized_name in clients_dict:
                clients_dict[tracker_client_normalized_name].everhour_clients_ids.append(tracker_client.id)
                clients_dict[tracker_client_normalized_name].tracker_info.append(tracker_client)
            else:
                clients_dict[tracker_client.normalized_name] = Client(
                    id=neg_id,
                    name=tracker_client.name,
                    slug=tracker_client.slug,
                    is_strategic=False,
                    tracker_info=[],
                    everhour_clients_ids=[tracker_client.id],
                )
                clients_dict[tracker_client.normalized_name].tracker_info.append(tracker_client)
                neg_id = neg_id - 1

        self.__data = {
            client.id: client
            for client in clients_dict.values()
        }
