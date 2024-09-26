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
from models.domain import Offer
import models.helpers.beauty as beauty


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
        raw = self.models.tracker.get_appointments(after, before)
        ps_repo = self.models.products_or_services
        data = [
            ap.to_dict()
            for ap in raw
        ]
        df = pd.DataFrame(data)

        def enrich_row(row):
            try:
                row['date'] = row['date'].date()
                row['day_of_week'] = row['date'].strftime('%A')
                row['n_day_of_week'] = (row['date'].weekday() + 1) % 7
                row['month'] = row['date'].strftime('%B')
                row['year'] = row['date'].strftime('%Y')
                row['year_month'] = row['date'].strftime('%Y-%m')

                worker = self.models.workers.get_by_everhour_id(row['user_id'])
                row['worker_name'] = worker.name if worker else None
                row['worker_slug'] = worker.slug if worker else None
                row['worker_omni_url'] = worker.omni_url if worker else None
                row['worker'] = f"<a href='{worker.omni_url}'>{worker.name}</a>" if worker else None

                case = self.models.cases.get_by_everhour_project_id(row['project_id'])
                row['case_id'] = case.id
                row['case_title'] = case.title
                row['sponsor'] = case.sponsor
                row['case'] = f"<a href='{case.omni_url}'>{case.title}</a>"
                # row['case_omni_url'] = case.omni_url if case else None

                products_or_services: List[Offer] = [
                    ps_repo.get_by_id(offer).name
                    for offer in case.offers_ids
                ]

                row['products_or_services'] = ';'.join(products_or_services)

                client = self.models.clients.get_by_id(case.client_id) if case.client_id else None
                row['client_id'] = client.id if client else "N/A"
                row['client_name'] = client.name if client else "N/A"
                row['client_omni_url'] = client.omni_url if client else "N/A"
                row['client'] = f"<a href='{client.omni_url}'>{client.name}</a>" if client else None

                if client and client.account_manager:
                    row['account_manager_name'] = client.account_manager.name
                    row['account_manager_slug'] = client.account_manager.slug
                else:
                    row['account_manager_name'] = "N/A"
                    row['account_manager_slug'] = "N/A"
            except Exception as e:
                self.logger.error(f'Failed to enrich row for case: {case.title}')

            return row

        df = df.apply(enrich_row, axis=1)

        return SummarizablePowerDataFrame(df)

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


def get_six_weeks_allocation_analysis(
        df: pd.DataFrame,
        date_of_interest: datetime,
        column_of_interest: str = 'WorkerName'
):
    week_day = (date_of_interest.weekday() + 1) % 7
    week = Weeks.get_week_string(date_of_interest)
    output_column_name = beauty.convert_to_label(column_of_interest)

    df = df[df['NDayOfWeek'] <= week_day]
    df_left = df[df['Week'] != week]
    df_right = df[df['Week'] == week]

    summary_left = df_left.groupby([column_of_interest, 'Week'])['TimeInHs'].sum().reset_index()
    summary_left = summary_left.groupby(column_of_interest)['TimeInHs'].mean().reset_index()
    summary_left.rename(columns={'TimeInHs': 'Mean'}, inplace=True)

    summary_right = df_right.groupby(column_of_interest)['TimeInHs'].sum().reset_index()
    summary_right.rename(columns={'TimeInHs': 'Current'}, inplace=True)
    merged_summary = pd.merge(summary_left, summary_right, on=column_of_interest, how='outer').fillna(0)
    merged_summary.rename(columns={column_of_interest: output_column_name}, inplace=True)

    merged_summary['Total'] = merged_summary['Current'] + merged_summary['Mean']
    merged_summary = merged_summary.sort_values(by='Total', ascending=False).reset_index(drop=True)
    merged_summary.drop(columns=['Total'], inplace=True)

    conditions = [
        merged_summary['Current'] > merged_summary['Mean'],
        merged_summary['Current'] < merged_summary['Mean'],
        merged_summary['Current'] == merged_summary['Mean']
    ]
    choices = [1, -1, 0]

    merged_summary['Status'] = np.select(conditions, choices, default=0)

    cols = ['Status', output_column_name, 'Mean', 'Current']
    return merged_summary[cols]


class TimesheetDateAnalysis:
    def __init__(self, df, date_of_interest: datetime, number_of_weeks: int = 6):
        day_of_week = date_of_interest.strftime('%A')

        kind_order = ['Squad', 'Consulting', 'Internal']

        kinds_present = [kind for kind in kind_order if kind in df['Kind'].unique()]

        dates_of_interest = [(date_of_interest - timedelta(weeks=i)).date() for i in range(number_of_weeks)]
        dates_of_interest = [d for d in dates_of_interest if d.strftime('%A') == day_of_week]

        ds = df[df['DayOfWeek'] == day_of_week]
        self.daily_summary = ds.groupby(['Date', 'Kind'])['TimeInHs'].sum().unstack().fillna(0)

        all_dates_df = pd.DataFrame(0, index=dates_of_interest, columns=kinds_present)
        all_dates_df.index.name = 'Date'

        self.daily_summary = pd.concat([self.daily_summary, all_dates_df]).groupby('Date').sum().fillna(0)
        self.daily_summary = self.daily_summary.sort_index()

        current_day_data = df[df['Date'] == date_of_interest.date()]
        self.total_hours = current_day_data['TimeInHs'].sum()

        past_data = ds[ds['Date'] < date_of_interest.date()]
        ds_grouped = past_data.groupby('Date')['TimeInHs'].sum()

        past_dates_of_interest = [d for d in dates_of_interest if d < date_of_interest.date()]
        past_dates_reference = pd.DataFrame(
            past_dates_of_interest, columns=['Date']
        ).set_index('Date')

        ds_grouped = past_dates_reference.join(ds_grouped, how='left').fillna(0)['TimeInHs']

        self.best_day = ds_grouped.idxmax()
        self.best_day_hours = ds_grouped.max()

        self.worst_day = ds_grouped.idxmin()
        self.worst_day_hours = ds_grouped.min()

        self.average_hours = ds_grouped.mean()


class TimelinessSummary:
    def __init__(self, df):
        self.df = df

        # Cálculos gerais
        self.total_rows = len(df)
        self.total_time_in_hours = df['TimeInHs'].sum()

        # Filtros para os diferentes status
        self.early_filter = df['Correctness'].str.startswith('WTF -')
        self.ok_filter = df['Correctness'] == 'OK'
        self.acceptable_filter = df['Correctness'] == 'Acceptable (1)'
        self.other_filter = ~(self.early_filter | self.ok_filter | self.acceptable_filter)

        # Contagem e soma das horas para cada status
        self.early_rows = df[self.early_filter].shape[0]
        self.early_time_in_hours = df.loc[self.early_filter, 'TimeInHs'].sum()

        self.ok_rows = df[self.ok_filter].shape[0]
        self.ok_time_in_hours = df.loc[self.ok_filter, 'TimeInHs'].sum()

        self.acceptable_rows = df[self.acceptable_filter].shape[0]
        self.acceptable_time_in_hours = df.loc[self.acceptable_filter, 'TimeInHs'].sum()

        self.late_rows = df[self.other_filter].shape[0]
        self.late_time_in_hours = df.loc[self.other_filter, 'TimeInHs'].sum()

        # Cálculo das porcentagens
        total_hours = self.total_time_in_hours
        if total_hours == 0:
            self.early_percentage = 0
            self.ok_percentage = 100
            self.acceptable_percentage = 0
            self.late_percentage = 0
        else:
            self.early_percentage = (self.early_time_in_hours / total_hours) * 100
            self.ok_percentage = (self.ok_time_in_hours / total_hours) * 100
            self.acceptable_percentage = (self.acceptable_time_in_hours / total_hours) * 100
            self.late_percentage = (self.late_time_in_hours / total_hours) * 100

        # Pré-calculando os resumos de trabalhadores por status
        self.early_workers = self._create_worker_summary(self.early_filter)
        self.ok_workers = self._create_worker_summary(self.ok_filter)
        self.acceptable_workers = self._create_worker_summary(self.acceptable_filter)
        self.late_workers = self._create_worker_summary(self.other_filter)

    def _create_worker_summary(self, filter_condition):
        # Agrupa por WorkerName e calcula o número de entradas e o total de horas
        worker_group = self.df[filter_condition].groupby('WorkerName').agg(
            entries=('WorkerName', 'size'),
            time_in_hours=('TimeInHs', 'sum')
        ).reset_index()

        # Cria a lista de dicionários para cada trabalhador
        worker_list = [
            {
                'worker': row['WorkerName'],
                'entries': row['entries'],
                'time_in_hours': row['time_in_hours']
            }
            for _, row in worker_group.iterrows()
        ]

        return worker_list


class TimeSheetFieldSummary:
    def __init__(self, df: pd.DataFrame, field: str):
        self.no_data = len(df) == 0
        if self.no_data:
            return

        self.total_hours = df['TimeInHs'].sum()

        self.grouped_total_hours = df.groupby([field, 'Kind'])['TimeInHs'].sum().unstack().fillna(0)
        self.grouped_total_hours['Total'] = self.grouped_total_hours.sum(axis=1)
        self.grouped_total_hours = self.grouped_total_hours.sort_values('Total', ascending=False)

        self.unique = df[field].nunique()
        self.avg_hours = self.total_hours / self.unique
        self.std_hours = df.groupby([field])['TimeInHs'].sum().std()

        cumulative_hours = self.grouped_total_hours['Total'].cumsum()
        cumulative_hours_80 = cumulative_hours[cumulative_hours <= cumulative_hours.iloc[-1] * 0.80]
        if len(cumulative_hours_80) == 0:
            self.allocation_80 = 0
        else:
            self.allocation_80 = \
                cumulative_hours[cumulative_hours <= cumulative_hours.iloc[-1] * 0.80].index[-1]


class TimesheetCommonQueries:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def list_products_or_services(self) -> List[str]:
        separated_products_or_services = set()

        for items in self.df['ProductsOrServices'].unique():
            separated_products_or_services.update(items.split(';'))

        return list(separated_products_or_services)
