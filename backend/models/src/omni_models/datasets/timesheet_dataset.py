import logging
from datetime import datetime, timedelta
from typing import List

import pandas as pd
import numpy as np

from omni_utils.decorators.cache import cache
from omni_models.base.powerdataframe import SummarizablePowerDataFrame
from omni_models.datasets.omni_dataset import OmniDataset
from omni_utils.helpers.weeks import Weeks
from omni_utils.helpers.slug import slugify
from omni_models.omnimodels import OmniModels

class TimesheetMemoryCache:
    def __init__(self):
        self.cache = []

    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        for m in self.cache:
            if m['after'] <= after and m['before'] >= before:
                df = m['result'].data
                df = df[df['Date'] >= after.date()]
                df = df[df['Date'] <= before.date()]
                return SummarizablePowerDataFrame(df)
        return None
    
    def add(self, after: datetime, before: datetime, result: SummarizablePowerDataFrame):
        self.cache.append({
            "after": after,
            "before": before,
            "result": result
        })

    def list_cache(self):
        return [
            {
                "after": m['after'],
                "before": m['before'],
            }
            for m in self.cache
        ]

class TimesheetDataset(OmniDataset):
    def __init__(self, models: OmniModels = None):
        self.models = models or OmniModels()
        self.logger = logging.getLogger(self.__class__.__name__)
        self.memory = TimesheetMemoryCache()

    def get_treemap_path(self):
        return 'TimeInHs', ['Kind', 'ClientName', 'WorkerName']

    def get_filterable_fields(self):
        return ['Kind', 'AccountManagerName', 'ClientName', 'CaseTitle', 'Sponsor', 'WorkerName']

    @cache
    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        
        result = self.memory.get(after, before)
        if result:
            self.logger.info(f"Getting appointments from cache from {after} to {before}.")
            return result
        
        start_time = datetime.now()
        self.logger.info(f"Getting appointments from {after} to {before}")
        raw = self.models.tracker.get_appointments(after, before)
        elapsed_time = datetime.now() - start_time
        self.logger.info(f"Time to get appointments: {elapsed_time.total_seconds():.2f} seconds")
        
        data = [ap.to_dict() for ap in raw]
        df = pd.DataFrame(data)
        
        
        start_time = datetime.now()
        self.logger.info(f"Enriching timesheet data")
        
        
        # Check if df is empty
        if df.empty:
            return SummarizablePowerDataFrame(pd.DataFrame())

        # Create caches
        workers_cache = {}
        cases_cache = {}
        clients_cache = {}
        offers_cache = {}
        eh_projects_cache = self.models.tracker.all_projects

        # Pre-fetch all needed data
        unique_user_ids = df['user_id'].unique()
        unique_project_ids = df['project_id'].unique()
        
        # Bulk load workers
        for user_id in unique_user_ids:
            workers_cache[user_id] = self.models.workers.get_by_everhour_id(user_id)
        
        # Bulk load cases
        for project_id in unique_project_ids:
            cases_cache[project_id] = self.models.cases.get_by_everhour_project_id(project_id)
        
        # Bulk load clients and offers
        unique_client_ids = set()
        unique_offer_ids = set()
        for case in cases_cache.values():
            if case:
                if case.client_id:
                    unique_client_ids.add(case.client_id)
                if hasattr(case, 'offers_ids'):
                    unique_offer_ids.update(case.offers_ids)
        
        for client_id in unique_client_ids:
            clients_cache[client_id] = self.models.clients.get_by_id(client_id)
        
        for offer_id in unique_offer_ids:
            offer = self.models.products_or_services.get_by_id(offer_id)
            offers_cache[offer_id] = offer.name if offer else None

        # Optimize by pre-allocating arrays for better memory usage
        n_rows = len(df)
        
        # Create typed arrays for better performance
        client_data = {
            'client_id': np.full(n_rows, "N/A", dtype=object),
            'client_name': np.full(n_rows, "N/A", dtype=object),
            'client_slug': np.full(n_rows, "N/A", dtype=object),
            'client_omni_url': np.full(n_rows, "N/A", dtype=object),
            'client': np.full(n_rows, "N/A", dtype=object),
            'account_manager_name': np.full(n_rows, "N/A", dtype=object),
            'account_manager_slug': np.full(n_rows, "N/A", dtype=object)
        }

        # Optimize date operations using pandas
        date_series = pd.to_datetime(df['date'])
        df = df.assign(
            date=date_series.dt.date,
            day_of_week=date_series.dt.strftime('%A'),
            n_day_of_week=date_series.dt.weekday.apply(lambda x: (x + 1) % 7),
            month=date_series.dt.strftime('%B'),
            year=date_series.dt.strftime('%Y'),
            year_month=date_series.dt.strftime('%Y-%m')
        )

        # Create numpy arrays for project and user IDs for faster lookups
        project_ids = df['project_id'].values
        user_ids = df['user_id'].values

        # Vectorized billing information using numpy masks
        billing_type = np.full(n_rows, None, dtype=object)
        billing_fee = np.full(n_rows, None, dtype=object)
        
        for pid in np.unique(project_ids):
            mask = project_ids == pid
            project = eh_projects_cache.get(pid)
            if project and project.billing:
                billing_type[mask] = project.billing.type
                billing_fee[mask] = project.billing.fee
        
        df['billing_type'] = billing_type
        df['billing_fee'] = billing_fee

        # Vectorized worker information
        worker_data = {field: np.full(n_rows, None, dtype=object) for field in ['worker_name', 'worker_slug', 'worker_omni_url']}
        
        for uid in np.unique(user_ids):
            mask = user_ids == uid
            worker = workers_cache.get(uid)
            if worker:
                worker_data['worker_name'][mask] = worker.name
                worker_data['worker_slug'][mask] = worker.slug
                worker_data['worker_omni_url'][mask] = worker.omni_url
        
        df = df.assign(**worker_data)
        
        # Create worker links using pandas operations instead of numpy char operations
        valid_worker_mask = df['worker_name'].notna() & df['worker_omni_url'].notna()
        df['worker'] = None
        df.loc[valid_worker_mask, 'worker'] = (
            '<a href="' + 
            df.loc[valid_worker_mask, 'worker_omni_url'] + 
            '">' + 
            df.loc[valid_worker_mask, 'worker_name'] + 
            '</a>'
        )

        # Vectorized case information using numpy operations
        case_data = {
            'case_id': np.full(n_rows, "N/A", dtype=object),
            'case_title': np.full(n_rows, "N/A", dtype=object),
            'case_slug': np.full(n_rows, "N/A", dtype=object),
            'sponsor': np.full(n_rows, "N/A", dtype=object),
            'case_omni_url': np.full(n_rows, "N/A", dtype=object)
        }
        
        for pid in np.unique(project_ids):
            mask = project_ids == pid
            case = cases_cache.get(pid)
            if case:
                case_data['case_id'][mask] = case.id
                case_data['case_title'][mask] = case.title
                case_data['case_slug'][mask] = case.slug
                case_data['sponsor'][mask] = case.sponsor or "N/A"
                case_data['case_omni_url'][mask] = case.omni_url
                
                # Update client data in the same loop to avoid multiple iterations
                if case.client_id:
                    client = clients_cache.get(case.client_id)
                    if client:
                        client_data['client_id'][mask] = client.id
                        client_data['client_name'][mask] = client.name
                        client_data['client_slug'][mask] = client.slug
                        client_data['client_omni_url'][mask] = client.omni_url
                        client_data['client'][mask] = f"<a href='{client.omni_url}'>{client.name}</a>"
                        if client.account_manager:
                            client_data['account_manager_name'][mask] = client.account_manager.name
                            client_data['account_manager_slug'][mask] = client.account_manager.slug
        
        df = df.assign(**case_data)
        df = df.assign(**client_data)
        
        # Optimize sponsor_slug creation using numpy
        df['sponsor_slug'] = np.vectorize(slugify)(df['sponsor'].values)

        # Optimize products_or_services using numpy operations
        products = np.full(n_rows, "N/A", dtype=object)
        for pid in np.unique(project_ids):
            mask = project_ids == pid
            case = cases_cache.get(pid)
            if case and hasattr(case, 'offers_ids'):
                products[mask] = ';'.join(filter(None, [offers_cache.get(oid) for oid in case.offers_ids]))
        
        df['products_or_services'] = products

        elapsed_time = datetime.now() - start_time
        self.logger.info(f"Time to enrich timesheet data: {elapsed_time.total_seconds():.2f} seconds")
        
        result = SummarizablePowerDataFrame(df)
        
        self.memory.add(after, before, result)

        return result
    
    def get_common_fields(self):
        return ['Kind', 'ClientName', 'Sponsor', 'WorkerName', 'TimeInHs', 'Date', 'Week', 'IsLte']

    def get_all_fields(self):
        return ['Id',
                'CreatedAt',
                'Date',
                'DayOfWeek',
                'Month',
                'Year',
                'Comment',
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
                'CaseSlug',
                'CaseTitle',
                'Sponsor',
                'SponsorSlug',
                #'Case',
                'ClientId',
                'ClientName',
                'ClientSlug',
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
