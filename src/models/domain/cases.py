from models.syntactic.wordpress import EventDetail
from models.semantic import Ontology, Case, TimeTracker, Project
import models.semantic.ontology as o
from typing import Optional, Dict, List
from models.domain.clients import ClientsRepository
from pydantic import BaseModel
from datetime import datetime
import models.helpers.numbers as numbers


class Case(BaseModel):
    id: str
    slug: str
    title: str
    is_active: bool
    client_id: Optional[str] = None
    everhour_projects_ids: Optional[List[str]] = []
    ontology_info: Optional[o.Case] = None
    tracker_info: Optional[List[Project]] = []
    updates: Optional[List[EventDetail]] = None
    status: Optional[str] = None
    last_updated: Optional[datetime] = None
    sponsor: Optional[str] = None
    offers_ids: Optional[List[int]] = []

    @property
    def errors(self):
        result = []
        if not self.has_description:
            result.append("NO DESCRIPTION")

        if not self.client_id:
            result.append("NO CLIENT")

        return result

    def find_client_name(self, clients_repository: ClientsRepository):
        if self.client_id:
            client = clients_repository.get_by_id(self.client_id)
            return client.name if client else "No client associated"
        else:
            return "No client associated"

    @property
    def has_description(self) -> bool:
        return self.ontology_info is not None

    @property
    def has_client(self) -> bool:
        return self.client_id is not None

    @property
    def has_everhour_projects_ids(self) -> bool:
        if not self.everhour_projects_ids:
            return False

        if len(self.everhour_projects_ids) == 0:
            return False

        return ':' in self.everhour_projects_ids[0]

    @property
    def number_of_days_with_no_updates(self) -> int:
        if not self.has_description:
            return 0

        return (datetime.now() - self.ontology_info.last_update_gmt).days

    @property
    def has_updated_description(self) -> bool:
        return self.is_active and self.has_description and self.number_of_days_with_no_updates < 30

    @property
    def omni_url(self) -> str:
        return f'/cases/{self.slug}'


class CasesRepository:
    def __init__(self,
                 ontology: Optional[Ontology] = None,
                 tracker: Optional[TimeTracker] = None,
                 clients_repository: ClientsRepository = None
                 ):
        self.ontology = ontology or Ontology()
        self.tracker = tracker or TimeTracker()
        self.clients_repository = clients_repository
        self.__data: Dict[int, Case] = None

    def get_all(self) -> Dict[str, Case]:
        if self.__data is None:
            self.__build_data()

        return self.__data

    def get_active_cases(self) -> List[Case]:
        cases = self.get_all()
        return [case for case in cases.values() if case.is_active and case.has_client]

    def get_cases_with_ids(self, case_ids: List[str]) -> Dict[str, Case]:
        all_cases = self.get_all().values()
        result = {
            case.id: case
            for case in all_cases
            if case.id in case_ids
        }
        return result

    def get_by_id(self, id: int) -> Case:
        if self.__data is None:
            self.__build_data()

        attempt1 = self.__data.get(id, None)
        if attempt1 is not None:
            return attempt1

        if numbers.can_convert_to_int(id):
            return self.__data[int(id)]

        raise KeyError(f'No case with id {id}')

    def get_by_slug(self, slug: str) -> Case:
        o_case = next((case for case in self.get_all().values() if case.slug == slug), None)
        return o_case

    def get_by_everhour_project_id(self, id) -> Case:
        cases = self.get_all().values()
        for case in cases:
            if id in case.everhour_projects_ids:
                return case
        return None

    # def get_by_slug(self, slug: str) -> Case:
    #     return next((worker for worker in self.ontology.workers.values() if worker.slug == slug), None)

    def __build_data(self) -> Dict[str, Case]:
        cases_dict: Dict[str, Case] = {}

        onto_cases = self.ontology.cases.values()
        projects_cases = {}

        for onto_case in onto_cases:
            if onto_case.sponsor:
                onto_case.sponsor = onto_case.sponsor.replace(' / ', ';')
                onto_case.sponsor = onto_case.sponsor.replace('/', ';')
                onto_case.sponsor = onto_case.sponsor.replace("' ", "'")
            else:
                onto_case.sponsor = "N/A"

            new_case = Case(
                id=str(onto_case.id),
                title=onto_case.title,
                slug=onto_case.slug,
                is_active=onto_case.is_active,
                everhour_projects_ids=onto_case.everhour_projects_ids.split(
                    ';'
                ) if onto_case.everhour_projects_ids else [],
                ontology_info=onto_case,
                tracker_info=[],
                sponsor=onto_case.sponsor,
                offers_ids=onto_case.offers
            )

            for idp in new_case.everhour_projects_ids:
                projects_cases[idp] = new_case

            if onto_case.client_id:
                new_case.client_id = onto_case.client_id
            if onto_case.updates:
                updates = [u for u in onto_case.updates if u.date]
                new_case.updates = sorted(updates, key=lambda update: update.date, reverse=True)
                new_case.status = new_case.updates[0].status
                new_case.last_updated = new_case.updates[0].date

            cases_dict[onto_case.id] = new_case

        tracker_projects = self.tracker.all_projects.values()
        for tp in tracker_projects:
            case = projects_cases.get(tp.id, None)
            if case:
                case.tracker_info.append(tp)
            else:
                new_case = Case(
                    id=f'tp-{tp.id}',
                    title=tp.name,
                    slug=tp.slug,
                    is_active=(tp.status == "open"),
                    tracker_info=[tp]
                )

                new_case.everhour_projects_ids.append(tp.id)
                client = self.clients_repository.get_by_everhour_id(tp.client_id)
                new_case.client_id = client.id if client else None

                cases_dict[f'tp-{tp.id}'] = new_case

        self.__data = cases_dict
