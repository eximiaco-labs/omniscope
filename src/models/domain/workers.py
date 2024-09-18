from enum import Enum
from typing import Optional, Dict

from pydantic import BaseModel

import models.semantic.ontology as o
import models.syntactic.everhour as t

from models.semantic import Insights, Ontology, TasksManager, TimeTracker, SalesFunnelB2B


class WorkerKind(Enum):
    ALL = "All"
    ACCOUNT_MANAGER = "Account Manager"
    CONSULTANT = "Consultant"


class Worker(BaseModel):
    id: int
    slug: str
    name: str
    kind: WorkerKind
    ontology_user_id: Optional[int] = None
    insights_user_id: Optional[int] = None
    todoist_user_id: Optional[int] = None
    pipedrive_user_id: Optional[int] = None
    ontology_info: Optional[o.Worker] = None
    tracker_info: Optional[t.User] = None

    @property
    def errors(self):
        result = []
        if not self.ontology_info:
            result.append("NO PROFILE")

        if self.kind == WorkerKind.CONSULTANT:
            if not self.tracker_info:
                result.append("NO TRACKING")

            if not self.ontology_user_id:
                result.append("NO ONTO ENTRIES")

            if not self.insights_user_id:
                result.append("NO INSIGHTS")

            # ltes = globals.omni.get_last_six_weeks_ltes_df().filter_by('WorkerSlug', self.slug).data
            # if len(ltes) > 0:
            #     result.append(f"LTE:{len(ltes)}")

        return result

    @property
    def is_recognized(self):
        return self.ontology_info is not None

    @property
    def omni_url(self) -> str:
        if self.kind == WorkerKind.ACCOUNT_MANAGER:
            return f'/account-managers/{self.slug}'
        else:
            return f'/consultants/{self.slug}'

    @property
    def photo_url(self):
        if self.is_recognized:
            return self.ontology_info.photo_url
        else:
            return '/assets/who_is_it.jpeg'

    @property
    def is_ontology_author(self):
        return


class WorkersRepository:

    def __init__(self,
                 ontology: Optional[Ontology] = None,
                 tracker: Optional[TimeTracker] = None,
                 insights: Optional[Insights] = None,
                 tasksmanager: Optional[TasksManager] = None,
                 salesfunnel: Optional[SalesFunnelB2B] = None,
                 ):
        self.ontology = ontology or Ontology()
        self.tracker = tracker or TimeTracker()
        self.insights = insights or Insights()
        self.tasksmanager = tasksmanager or TasksManager()
        self.salesfunnel = salesfunnel or SalesFunnelB2B()
        self.__data: Dict[int, Worker] = None

    def get_all(self, kind: Optional[WorkerKind] = WorkerKind.ALL) -> Dict[int, Worker]:
        if not self.__data:
            self.__build_data()

        if kind == WorkerKind.ALL:
            return self.__data

        return {
            worker.id: worker
            for worker in self.__data.values()
            if worker.kind == kind
        }

    def get_by_id(self, id: int) -> Worker:
        return self.get_all()[id]

    def get_by_slug(self, slug: str) -> Worker:
        all_workers = self.get_all().values()
        return next((worker for worker in all_workers if worker.slug == slug), None)

    def get_by_name(self, name: str) -> Worker:
        all_workers = self.get_all().values()
        return next((worker for worker in all_workers if worker.name == name), None)

    def get_by_everhour_id(self, id: int) -> Worker:
        all_workers = self.get_all().values()
        return next(
            (worker
             for worker in all_workers
             if worker.tracker_info is not None and worker.tracker_info.id == id
             )
            , None
        )

    def get_by_todoist_id(self, id: int) -> Worker:
        all_workers = self.get_all().values()
        return next(
            (worker
             for worker in all_workers
             if worker.todoist_user_id == id
             )
            , None
        )

    def get_by_ontology_user_id(self, user_id: int) -> Worker:
        all_workers = self.get_all().values()
        return next(
            (
                worker
                for worker in all_workers
                if worker.ontology_user_id == user_id
            ), None
        )

    def get_by_insights_user_id(self, user_id: int) -> Worker:
        all_workers = self.get_all().values()
        return next(
            (
                worker
                for worker in all_workers
                if worker.insights_user_id == user_id
            ), None
        )

    def get_by_pipedrive_user_id(self, user_id: int) -> Worker:
        all_workers = self.get_all().values()
        return next(
            (
                worker
                for worker in all_workers
                if worker.pipedrive_user_id == user_id
            ), None
        )

    def __build_data(self) -> Dict[int, Worker]:

        workers_dict: Dict[str, Worker] = {}

        onto_workers = self.ontology.workers.values()
        for onto_worker in onto_workers:
            workers_dict[onto_worker.name] = Worker(
                id=onto_worker.id,
                name=onto_worker.name,
                slug=onto_worker.slug,
                kind=WorkerKind.ACCOUNT_MANAGER if onto_worker.is_account_manager else WorkerKind.CONSULTANT,
                ontology_info=onto_worker
            )

        neg_id = -1
        tracker_workers = self.tracker.active_workers.values()
        for tracker_worker in tracker_workers:
            if tracker_worker.name in workers_dict:
                workers_dict[tracker_worker.name].tracker_info = tracker_worker
            else:
                workers_dict[tracker_worker.name] = Worker(
                    id=neg_id,
                    name=tracker_worker.name,
                    slug=tracker_worker.slug,
                    kind=WorkerKind.CONSULTANT,
                    tracker_info=tracker_worker
                )
                neg_id = neg_id - 1

        onto_users = self.ontology.authors.values()
        for user in onto_users:
            if user.name in workers_dict:
                workers_dict[user.name].ontology_user_id = user.id
            else:
                workers_dict[user.name] = Worker(
                    id=neg_id,
                    name=user.name,
                    slug=user.slug,
                    kind=WorkerKind.CONSULTANT,
                    ontology_user_id=user.id,
                )
                neg_id = neg_id - 1

        insights_users = self.insights.publishers.values()
        for user in insights_users:
            if user.name in workers_dict:
                workers_dict[user.name].insights_user_id = user.id
            else:
                workers_dict[user.name] = Worker(
                    id=neg_id,
                    name=user.name,
                    slug=user.slug,
                    kind=WorkerKind.CONSULTANT,
                    insights_user_id=user.id,
                )
                neg_id = neg_id - 1

        def find_matching_key(workers_dict, full_name):
            if full_name.endswith('.'):
                base_name = full_name[:-1]
                for key in workers_dict.keys():
                    if key.startswith(base_name):
                        return key
            return full_name

        tasksmanager_users = self.tasksmanager.users
        for user in tasksmanager_users:
            full_name = user.full_name
            matching_key = find_matching_key(workers_dict, full_name)

            if matching_key in workers_dict:
                workers_dict[matching_key].todoist_user_id = user.id
            else:
                workers_dict[full_name] = Worker(
                    id=neg_id,
                    name=full_name,
                    slug=user.slug,
                    kind=WorkerKind.CONSULTANT,
                    todoist_user_id=user.id,
                )
                neg_id -= 1

        salesfunnel_users = self.salesfunnel.active_account_managers
        for user in salesfunnel_users:
            full_name = user.name
            matching_key = find_matching_key(workers_dict, full_name)

            if matching_key in workers_dict:
                workers_dict[matching_key].pipedrive_user_id = user.id
            else:
                workers_dict[full_name] = Worker(
                    id=neg_id,
                    name=full_name,
                    slug=user.slug,
                    kind=WorkerKind.ACCOUNT_MANAGER,
                    todoist_user_id=user.id,
                )
                neg_id -= 1

        self.__data = {
            worker.id: worker
            for worker in workers_dict.values()
        }
