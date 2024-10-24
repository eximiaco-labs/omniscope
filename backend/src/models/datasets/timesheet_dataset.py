import logging
from datetime import datetime, timedelta
from typing import List

import pandas as pd
import numpy as np

from decorators import cache
from models.base.powerdataframe import SummarizablePowerDataFrame
from models.datasets.omni_dataset import OmniDataset
from models.helpers.weeks import Weeks
from models.omnimodels import OmniModels


class TimesheetDataset(OmniDataset):
    def __init__(self, models: OmniModels = None):
        self.models = models or OmniModels()
        self.logger = logging.getLogger(self.__class__.__name__)

    def get_treemap_path(self):
        return 'TimeInHs', ['Kind', 'ClientName', 'WorkerName']

    def get_filterable_fields(self):
        return ['Kind', 'AccountManagerName', 'ClientName', 'CaseTitle', 'Sponsor', 'WorkerName']

    @cache
    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        # Obter compromissos brutos e converter para DataFrame
        raw = self.models.tracker.get_appointments(after, before)
        data = [ap.to_dict() for ap in raw]
        df = pd.DataFrame(data)

        # Criação de cache para evitar múltiplas consultas repetidas
        workers_cache = {}
        cases_cache = {}
        clients_cache = {}
        offers_cache = {}

        # Função para obter trabalhador e usar cache
        def get_worker(user_id):
            if user_id not in workers_cache:
                workers_cache[user_id] = self.models.workers.get_by_everhour_id(user_id)
            return workers_cache[user_id]

        # Função para obter caso e usar cache
        def get_case(project_id):
            if project_id not in cases_cache:
                cases_cache[project_id] = self.models.cases.get_by_everhour_project_id(project_id)
            return cases_cache[project_id]

        # Função para obter cliente e usar cache
        def get_client(client_id):
            if client_id not in clients_cache and client_id is not None:
                clients_cache[client_id] = self.models.clients.get_by_id(client_id)
            return clients_cache.get(client_id)

        # Função para obter produto ou serviço e usar cache
        def get_offer_name(offer_id):
            if offer_id not in offers_cache:
                offer = self.models.products_or_services.get_by_id(offer_id)
                offers_cache[offer_id] = offer.name if offer else None
            return offers_cache[offer_id]

        # Transformações vetorizadas para dados de data
        df['date'] = pd.to_datetime(df['date']).dt.date
        df['day_of_week'] = df['date'].apply(lambda x: x.strftime('%A'))
        df['n_day_of_week'] = df['date'].apply(lambda x: (x.weekday() + 1) % 7)
        df['month'] = df['date'].apply(lambda x: x.strftime('%B'))
        df['year'] = df['date'].apply(lambda x: x.strftime('%Y'))
        df['year_month'] = df['date'].apply(lambda x: x.strftime('%Y-%m'))

        # Função para enriquecer as linhas
        def enrich_row(row):
            try:
                # Enriquecer com dados do trabalhador
                worker = get_worker(row['user_id'])
                if worker:
                    row['worker_name'] = worker.name
                    row['worker_slug'] = worker.slug
                    row['worker_omni_url'] = worker.omni_url
                    row['worker'] = f"<a href='{worker.omni_url}'>{worker.name}</a>"
                else:
                    row['worker_name'] = row['worker_slug'] = row['worker_omni_url'] = row['worker'] = None

                # Enriquecer com dados do caso
                case = get_case(row['project_id'])
                if case:
                    row['case_id'] = case.id
                    row['case_title'] = case.title
                    row['sponsor'] = case.sponsor
                    row['case'] = f"<a href='{case.omni_url}'>{case.title}</a>"

                    # Obter produtos ou serviços associados
                    products_or_services = [get_offer_name(offer) for offer in case.offers_ids]
                    row['products_or_services'] = ';'.join(filter(None, products_or_services))

                    # Enriquecer com dados do cliente
                    client = get_client(case.client_id)
                    if client:
                        row['client_id'] = client.id
                        row['client_name'] = client.name
                        row['client_omni_url'] = client.omni_url
                        row['client'] = f"<a href='{client.omni_url}'>{client.name}</a>"
                        row['account_manager_name'] = client.account_manager.name if client.account_manager else "N/A"
                        row['account_manager_slug'] = client.account_manager.slug if client.account_manager else "N/A"
                    else:
                        row['client_id'] = row['client_name'] = row['client_omni_url'] = row['client'] = "N/A"
                        row['account_manager_name'] = row['account_manager_slug'] = "N/A"
                else:
                    row['case_id'] = row['case_title'] = row['sponsor'] = row['case'] = "N/A"
                    row['products_or_services'] = "N/A"
                    row['client_id'] = row['client_name'] = row['client_omni_url'] = row['client'] = "N/A"
                    row['account_manager_name'] = row['account_manager_slug'] = "N/A"
            except Exception as e:
                self.logger.error(f'Failed to enrich row for timesheet.')

            return row

        # Aplicar enriquecimento nas linhas
        df = df.apply(enrich_row, axis=1)

        return SummarizablePowerDataFrame(df.copy())

    def get_common_fields(self):
        return ['Kind', 'ClientName', 'Sponsor', 'WorkerName', 'TimeInHs', 'Date', 'Week', 'IsLte']

    def get_all_fields(self):
        return ['Id',
                'CreatedAt',
                'Date',
                'DayOfWeek',
                'Month',
                'Year',
                'YearMonth',
                'UserId',
                'Time',
                'ProjectId',
                'IsSquad',
                'IsEximiaco',
                'Week',
                'TimeInHs',
                'Kind',
                'CreatedAtWeek',
                'Correctness',
                'IsLte',
                'WorkerName',
                'WorkerSlug',
                'WorkerOmniUrl',
                'Worker',
                'CaseId',
                'CaseTitle',
                'Sponsor',
                'Case',
                'ClientId',
                'ClientName',
                'ClientOmniUrl',
                'ProductsOrServices',
                'Client',
                'AccountManagerName',
                'AccountManagerSlug'
                ]

    def get_last_four_weeks_ltes(self) -> SummarizablePowerDataFrame:
        data = self.get_last_six_weeks()

        previous5 = Weeks.get_previous_string(5)
        previous6 = Weeks.get_previous_string(6)

        data = (data
                .filter_by(by='Correctness', not_equals_to='OK')
                .filter_by(by='Correctness', not_equals_to='Acceptable (1)')
                .filter_by(by='Correctness', not_starts_with='WTF -')
                .filter_by(by='CreatedAtWeek', not_equals_to=previous5)
                .filter_by(by='CreatedAtWeek', not_equals_to=previous6)
                )

        return data