from datetime import datetime

import pandas as pd

from models.base.powerdataframe import SummarizablePowerDataFrame
from models.datasets.omni_dataset import OmniDataset
from models.omnimodels import OmniModels


class InsightsDataset(OmniDataset):
    def get_treemap_path(self):
        return 'Unit', ['PublisherName']

    def get_filterable_fields(self):
        return ['PublisherName']

    def __init__(self, models: OmniModels = None):
        self.models = models or OmniModels()

    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        entries = self.models.insights.fetch_insights(after, before)

        data = [
            entry.dict()
            for entry in entries
        ]
        df = pd.DataFrame(data)

        def enrich_row(row):
            worker = self.models.workers.get_by_insights_user_id(row['publisher_id'])
            row['worker_name'] = worker.name if worker else None
            row['worker_slug'] = worker.slug if worker else None
            row['worker_omni_url'] = worker.omni_url if worker else None
            row['worker'] = f"<a href='{worker.omni_url}'>{worker.name}</a>"

            return row

        df = df.apply(enrich_row, axis=1)

        result = (SummarizablePowerDataFrame(df)
                  .filter_by('PublisherName', not_equals_to='admin'))

        return result

    def get_common_fields(self):
        return ['Title', 'PublisherName', 'CreationDate', 'CreationWeek']

    def get_all_fields(self):
        return ['Id', 'Title', 'Link', 'PublisherId', 'PublisherName', 'CreationDate',
                'CreationWeek', 'WorkerName', 'WorkerSlug', 'WorkerOmniUrl', 'Worker']
