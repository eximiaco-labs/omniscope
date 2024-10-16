from datetime import datetime, timedelta, date
from models.helpers.weeks import Weeks
import globals

import pandas as pd

def resolve_timeliness_review(_, info, date_of_interest, filters=None):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')

    df = globals.omni_datasets.timesheets.get_last_six_weeks(date_of_interest).data
    start, _ = Weeks.get_week_dates(date_of_interest)

    # Compose filterable_fields and apply filters
    source = globals.omni_datasets.timesheets
    filterable_fields = source.get_filterable_fields()
    result = {'filterable_fields': []}

    for field in filterable_fields:
        options = sorted([value for value in df[field].unique().tolist() if value is not None])
        selected_values = []

        if filters:
            for filter_item in filters:
                if filter_item['field'] == field:
                    selected_values = filter_item['selected_values']
                    break

        result['filterable_fields'].append(
            {
                'field': field,
                'selected_values': selected_values,
                'options': options
            }
        )

        # Apply filter to dataframe
        if selected_values:
            df = df[df[field].isin(selected_values)]

    return TimelinessReview(df)

class TimelinessReview:
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