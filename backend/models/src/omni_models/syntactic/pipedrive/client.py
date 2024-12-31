from datetime import datetime
from typing import List
import requests
from omni_utils.decorators.cache import cache

from .models.activity import Activity
from .models.deal import Deal
from .models.note import Note
from .models.organization import Organization
from .models.person import Person
from .models.stage import Stage
from .models.user import User


class Pipedrive:
    def __init__(self, api_token):
        self.session = requests.Session()  # Use a session for connection pooling
        self.api_token = api_token

    def __fetch(self, entity, start=0, params=None):
        if params is None:
            params = {}
        url = f"https://api.pipedrive.com/v1/{entity}"

        # Set default query parameters
        params['api_token'] = self.api_token
        params['limit'] = 500
        params['start'] = start

        response = self.session.get(url, params=params)
        response.raise_for_status()  # Proper error handling
        return response.json()

    @staticmethod
    def __has_next_page(data):
        return data.get('additional_data', {}).get('pagination', {}).get('more_items_in_collection', False)

    def _fetch_all(self, entity, params=None):
        all_data = []
        start = 0

        while True:
            data = self.__fetch(entity, start, params)
            if data is None or 'data' not in data:
                break
            all_data.extend(data['data'])

            if not self.__has_next_page(data):
                break
            start = data.get('additional_data', {}).get('pagination', {}).get('next_start', 0)

        # Create DataFrame from all data at once
        return all_data

    @cache
    def fetch_active_deals_in_stage(self, stage_id, status ='open'):
        params = {
            'stage_id': stage_id,
            'status': status
        }
        json = self._fetch_all('deals', params=params)
        result = [Deal(**deal) for deal in json]

        return result

    @cache
    def fetch_stages_in_pipeline(self, pipeline_id):
        json = self._fetch_all('stages', params={'pipeline_id': pipeline_id})
        return [Stage(**stage) for stage in json]

    def fetch_activities(self, starting: datetime, ending: datetime):
        params = {
            'since': starting.strftime('%Y-%m-%d %H:%M:%S'),
            'until': ending.strftime('%Y-%m-%d %H:%M:%S'),
        }

        json = self._fetch_all('activities/collection', params=params)
        return [
            Activity(**activity)
            for activity in json
        ]

    @cache
    def fetch_people(self):
        params = {
            'fields': 'picture_id'
        }
        json = self._fetch_all('persons', params=params)
        return [Person(**person) for person in json]

    def fetch_notes(self, starting: datetime, ending: datetime) -> List[Note]:
        params = {
            'start_date': starting.strftime('%Y-%m-%d'),
            'end_date': ending.strftime('%Y-%m-%d'),
        }

        json = self._fetch_all('notes', params=params)

        return [
            Note(**n)
            for n in json
        ]

    def fetch_users(self):
        json = self._fetch_all('users')
        return [User(**user) for user in json]

    def fetch_clients(self):
        json = self._fetch_all('organizations')
        return [Organization(**client) for client in json] 