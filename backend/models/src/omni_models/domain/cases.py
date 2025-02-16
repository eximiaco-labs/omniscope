from omni_models.semantic.salesfunnel import Deal
from omni_models.syntactic import EventDetail
from omni_models.semantic import Ontology, Case, TimeTracker, Project
import omni_models.semantic.ontology as o
from typing import Optional, Dict, List
from omni_models.domain.clients import ClientsRepository
from pydantic import BaseModel
from datetime import datetime, date, timezone, timedelta
import re

import omni_utils.helpers.numbers as numbers
from omni_models.domain.active_deals import ActiveDealsRepository


class Case(BaseModel):
    id: str
    slug: str
    title: str
    is_active: bool
    pre_contracted_value: bool = False

    client_id: Optional[str] = None
    everhour_projects_ids: Optional[List[str]] = []
    ontology_info: Optional[o.Case] = None
    tracker_info: Optional[List[Project]] = []
    updates: Optional[List[EventDetail]] = None

    start_of_contract: Optional[date] = None
    end_of_contract: Optional[date] = None
    weekly_approved_hours: Optional[float] = None

    fixed_fee: Optional[float] = None

    status: Optional[str] = None
    last_updated: Optional[datetime] = None
    sponsor: Optional[str] = None
    offers_ids: Optional[List[int]] = []
    deals: List[Deal] = []


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
    def last_update(self):
        if self.updates is None or self.updates == []:
            return None
        return self.updates[0]

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

        if not self.last_updated:
            if not self.start_of_contract:
                return True
            else:
                return (datetime.now().date() - self.start_of_contract).days

        return (datetime.now() - self.last_updated).days if  not self.last_updated else 0

    @property
    def is_stale(self) -> bool:
        if not self.is_active:
            return False

        if self.number_of_days_with_no_updates <= 30:
            return False

        if not self.last_update:
            return True

        return True

    @property
    def has_updated_description(self) -> bool:
        return self.is_active and self.has_description and self.number_of_days_with_no_updates < 30
    
    @property
    def ontology_url(self) -> str:
        if not self.ontology_info:
            return None
        return self.ontology_info.link

    @property
    def omni_url(self) -> str:
        return f'/cases/{self.slug}'
    
    def has_contract_in_period(self, start: date, end: date) -> bool:
        if not self.start_of_contract and not self.end_of_contract:
            return self.is_active
        
        start = start.date() if isinstance(start, datetime) else start
        end = end.date() if isinstance(end, datetime) else end
        
        return (
            ((not self.start_of_contract) or self.start_of_contract <= end) and 
            ((not self.end_of_contract) or self.end_of_contract >= start)
        )

class CasesRepository:
    def __init__(self,
                 ontology: Optional[Ontology] = None,
                 tracker: Optional[TimeTracker] = None,
                 clients_repository: Optional[ClientsRepository]= None,
                 deals_repository: Optional[ActiveDealsRepository] = None
                 ):
        self.ontology = ontology or Ontology()
        self.tracker = tracker or TimeTracker()
        self.clients_repository = clients_repository
        self.deals_repository = deals_repository
        self.__data: Dict[int, Case] = None

    def get_all(self) -> Dict[str, Case]:
        if self.__data is None:
            self.__build_data()

        return self.__data

    def get_active_cases(self) -> List[Case]:
        cases = self.get_all()
        return [case for case in cases.values() if case.is_active and case.has_client]
    
    def get_live_cases_with_approved_hours(self, start_date, end_date) -> List[Case]:
        
        start_date = start_date.date() if isinstance(start_date, datetime) else start_date
        end_date = end_date.date() if isinstance(end_date, datetime) else end_date

        all_cases = self.get_all().values()
        
        all_cases = [
            case 
            for case in all_cases 
            if case.weekly_approved_hours
        ]

        all_cases = [
            case for case in all_cases
            if (not case.start_of_contract or case.start_of_contract <= end_date) and
               (not case.end_of_contract or case.end_of_contract >= start_date)
        ]

        return all_cases
        
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
    
    def get_by_title(self, title: str) -> Case:
        o_case = next((case for case in self.get_all().values() if case.title == title), None)
        return o_case

    def get_by_everhour_project_id(self, id) -> Case:
        cases = self.get_all().values()
        for case in cases:
            if id in case.everhour_projects_ids:
                return case
        return None
    
    def get_by_everhour_project_name(self, name: str) -> Case:
        cases = self.get_all().values()
        for case in cases:
            for ti in case.tracker_info:
                if ti.name == name:
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
                pre_contracted_value=onto_case.pre_contracted_value,
                everhour_projects_ids=onto_case.everhour_projects_ids.split(
                    ';'
                ) if onto_case.everhour_projects_ids else [],
                ontology_info=onto_case,
                start_of_contract=onto_case.start_of_contract,
                end_of_contract=onto_case.end_of_contract,
                weekly_approved_hours=onto_case.weekly_approved_hours,
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

        # ----

        for case in cases_dict.values():
            case.fixed_fee = 0
            for tracker_project in case.tracker_info:
                if (
                    tracker_project.billing and
                    tracker_project.billing.type == 'fixed_fee' and
                    tracker_project.billing.fee
                ):
                    case.fixed_fee += (tracker_project.billing.fee / 100)

        for case in cases_dict.values():
            for tracker_project in case.tracker_info:
                deal = self.deals_repository.get_by_everhour_id(tracker_project.id)
                if deal and (deal not in case.deals):
                    case.deals.append(deal)
                    
        for case in cases_dict.values():
            for tracker_project in case.tracker_info:
                if tracker_project.status == 'archived':
                    if not tracker_project.due_on:
                        due_on = None
                        
                        pattern = r'- E (\d{2})/(\d{4})$'
                        match = re.search(pattern, tracker_project.name)
                        if match:
                            month = int(match.group(1))
                            year = int(match.group(2))
                            # Get last day of the month
                            if month == 12:
                                next_month = datetime(year + 1, 1, 1, 23, 59, 59)
                            else:
                                next_month = datetime(year, month + 1, 1, 23, 59, 59)
                            due_on = next_month - timedelta(days=1)      
                        elif tracker_project.name.endswith("- 2024"):
                            due_on = datetime(year=2024, month=12, day=31, hour=23, minute=59, second= 59)
                        elif case.end_of_contract:
                            due_on = case.end_of_contract
                        elif case.is_active:
                            if tracker_project.kind != 'consulting':
                                due_on = self.tracker.find_project_due_on(tracker_project.id)
                            
                        if due_on:
                            tracker_project.due_on = due_on
                    
        self.__data = cases_dict
