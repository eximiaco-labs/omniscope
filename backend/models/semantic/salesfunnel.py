import pandas as pd
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

from models.base.semanticmodel import SemanticModel
from models.semantic import Ontology
from models.syntactic import Pipedrive
from models.helpers.weeks import Weeks
import models.helpers.slug as slug

from decorators import c4_external_system
from settings import api_settings


class Stage(BaseModel):
    id: int
    name: str
    order_nr: int


class Deal(BaseModel):
    id: int
    title: str
    stage_id: int
    stage_name: str
    stage_order_nr: int
    client_name: str
    account_manager_id: int
    account_manager_name: str
    add_time: Optional[datetime]
    update_time: Optional[datetime]

    days_since_last_update: Optional[int] = 0


class Activity(BaseModel):
    id: int
    type: str
    subject: Optional[str]
    user_id: int
    due_date: date
    update_time: datetime
    org_id: Optional[int] = None
    person_id: Optional[int] = None
    deal_id: Optional[int] = None

    deal_title: Optional[str] = None
    account_manager_name: Optional[str] = None
    account_manager: Optional[str] = None

    due_week: Optional[str] = None

    @property
    def update_week(self):
        return Weeks.get_week_string(self.update_time)

    @property
    def is_correct(self):
        return self.due_week == self.update_week


class AccountManager(BaseModel):
    id: int
    name: str

    @property
    def slug(self) -> str:
        return slug.generate(self.name)

@c4_external_system(
    "SalesFunnelB2B (Pipedrive)",
    "Information about deals and opportunities B2B",
)
class SalesFunnelB2B(SemanticModel):

    def __init__(self, pipedrive=None, ontology=None):
        self.pipedrive = pipedrive or Pipedrive(api_settings["pipedrive_api_key"])
        self.ontology = ontology or Ontology()

    @property
    def stages(self):
        return [
            Stage(**(s.dict()))
            for s in self.pipedrive.fetch_stages_in_pipeline(8)
        ]

    @property
    def active_deals(self) -> List[Deal]:
        return [
            Deal(
                id=deal.id,
                title=deal.title,
                add_time=deal.add_time,
                update_time=deal.update_time,
                stage_id=stage.id,
                stage_name=stage.name,
                stage_order_nr=stage.order_nr,
                account_manager_id=deal.user_id.id,
                account_manager_name=deal.user_id.name,
                client_name=deal.org_id.name if deal.org_id else None,
                days_since_last_update=(datetime.now() - deal.update_time).days,
            )
            for stage in self.stages
            for deal in self.pipedrive.fetch_active_deals_in_stage(stage.id)
        ]

    @property
    def active_account_managers(self) -> List[AccountManager]:
        deals = self.active_deals
        account_managers_dict = {}

        for deal in deals:
            if deal.account_manager_id not in account_managers_dict:
                account_managers_dict[deal.account_manager_id] = deal.account_manager_name

        account_managers = [
            AccountManager(id=am_id, name=am_name)
            for am_id, am_name in account_managers_dict.items()
        ]

        return account_managers

    def get_activities(self, starting: datetime, ending: datetime):

        deals = {
            d.id: d.title
            for d in self.active_deals
        }

        users = self.pipedrive.fetch_users()
        account_managers = {
            am.id: am.name
            for am in users
        }

        def create_activity_from_activity(source):
            result = Activity(**(source.dict()))
            result.deal_title = deals.get(source.deal_id, None)
            result.account_manager_name = account_managers.get(source.user_id, None)
            due = datetime(result.due_date.year, result.due_date.month, result.due_date.day)
            result.due_week = Weeks.get_week_string(due)
            return result

        activities = self.pipedrive.fetch_activities(starting, ending)
        activities = [
            create_activity_from_activity(a)
            for a in activities
        ]

        notes = self.pipedrive.fetch_notes(starting, ending)
        for note in notes:
            note.id = -note.id
            data = note.dict()
            data['subject'] = note.content
            data['due_date'] = date(note.add_time.year, note.add_time.month, note.add_time.day)
            activity = Activity(**data)

            activity.deal_title = deals.get(note.deal_id, None)
            activity.account_manager_name = account_managers.get(note.user_id, None)
            activity.due_week = Weeks.get_week_string(note.add_time)

            activities.append(activity)

        return [
            a for a in activities #if a.is_correct
        ]


    def get_summary_by_ca(self, compute_total=True):
        stages = self.get_stages()
        active_deals = self.get_active_deals()
        active_deals = active_deals[['id', 'customer_agent_html_name', 'stage_id']]
        by = 'Executivo'
        active_deals.columns = ['id', by, 'stage_id']

        results = pd.DataFrame(columns=[by])
        for _, row in stages.iterrows():
            stage = row['stage_id']
            stage_name = row['stage_name']
            active_deals_of_stage = active_deals[active_deals['stage_id'] == stage]
            summary_df = active_deals_of_stage.groupby(by).size().reset_index(name='Count')
            summary_df.columns = [by, stage_name]
            results = pd.merge(results, summary_df, on=by, how='outer')

        results.fillna(0, inplace=True)

        if compute_total:
            results['Total'] = results.iloc[:, 1:].sum(axis=1)
            results.sort_values(by='Total', ascending=False, inplace=True)
            total_row = pd.DataFrame([['Total'] + list(results.iloc[:, 1:].sum())], columns=results.columns)
            results = pd.concat([results, total_row], ignore_index=True)

        return results