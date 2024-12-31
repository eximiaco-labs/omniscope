from datetime import datetime, date
from typing import List

from omni_models.base.semanticmodel import SemanticModel
from omni_models.semantic import Ontology
from omni_models.syntactic import Pipedrive
from omni_utils.decorators.c4 import c4_external_system
from omni_shared.settings import api_settings
from omni_utils.helpers.weeks import Weeks

from omni_models.semantic.salesfunnel.models import Stage, Deal, Activity, AccountManager

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
                everhour_id=deal.everhour_id,
                client_name=deal.org_id.name if deal.org_id else None,
                days_since_last_update=(datetime.now() - deal.update_time).days,
            )
            for stage in self.stages
            for deal in self.pipedrive.fetch_active_deals_in_stage(stage.id)
        ]
        
    @property
    def won_deals(self) -> List[Deal]:
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
                everhour_id=deal.everhour_id,
                days_since_last_update=(datetime.now() - deal.update_time).days,
            )
            for stage in self.stages
            for deal in self.pipedrive.fetch_active_deals_in_stage(stage.id, 'won')
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
            a for a in activities
        ] 