from datetime import datetime
from models.helpers.weeks import Weeks
import globals

def compute_timeliness_review(date_of_interest, filters=None):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')

    df = globals.omni_datasets.timesheets.get_last_six_weeks(date_of_interest).data
    
    # Compose filterable_fields and apply filters
    df, result = globals.omni_datasets.apply_filters(
        globals.omni_datasets.timesheets,
        df,
        filters
    )

    # Cálculos gerais
    total_rows = len(df)
    total_time_in_hours = df['TimeInHs'].sum()

    # Filtros para os diferentes status
    early_filter = df['Correctness'].str.startswith('WTF -')
    ok_filter = df['Correctness'] == 'OK'
    acceptable_filter = df['Correctness'] == 'Acceptable (1)'
    other_filter = ~(early_filter | ok_filter | acceptable_filter)

    # Contagem e soma das horas para cada status
    early_rows = df[early_filter].shape[0]
    early_time_in_hours = df.loc[early_filter, 'TimeInHs'].sum()

    ok_rows = df[ok_filter].shape[0]
    ok_time_in_hours = df.loc[ok_filter, 'TimeInHs'].sum()

    acceptable_rows = df[acceptable_filter].shape[0]
    acceptable_time_in_hours = df.loc[acceptable_filter, 'TimeInHs'].sum()

    late_rows = df[other_filter].shape[0]
    late_time_in_hours = df.loc[other_filter, 'TimeInHs'].sum()

    # Cálculo das porcentagens
    if total_time_in_hours == 0:
        early_percentage = 0
        ok_percentage = 100
        acceptable_percentage = 0
        late_percentage = 0
    else:
        early_percentage = (early_time_in_hours / total_time_in_hours) * 100
        ok_percentage = (ok_time_in_hours / total_time_in_hours) * 100
        acceptable_percentage = (acceptable_time_in_hours / total_time_in_hours) * 100
        late_percentage = (late_time_in_hours / total_time_in_hours) * 100

    # Função auxiliar para criar resumos de trabalhadores
    def create_worker_summary(filter_condition):
        worker_group = df[filter_condition].groupby(['WorkerName', 'WorkerSlug']).agg(
            entries=('WorkerName', 'size'),
            time_in_hours=('TimeInHs', 'sum')
        ).reset_index()

        return [
            {
                'worker': row['WorkerName'],
                'workerSlug': row['WorkerSlug'],
                'entries': row['entries'],
                'time_in_hours': row['time_in_hours']
            }
            for _, row in worker_group.sort_values('time_in_hours', ascending=False).iterrows()
        ]

    # Criando os resumos de trabalhadores por status
    early_workers = create_worker_summary(early_filter)
    ok_workers = create_worker_summary(ok_filter)
    acceptable_workers = create_worker_summary(acceptable_filter)
    late_workers = create_worker_summary(other_filter)

    # Adicionando a menor e a maior data observadas
    min_date = df['Date'].min()
    max_date = df['Date'].max()

    # Compondo o dicionário final
    return {
        'total_rows': total_rows,
        'total_time_in_hours': total_time_in_hours,
        'early_rows': early_rows,
        'early_time_in_hours': early_time_in_hours,
        'early_percentage': early_percentage,
        'ok_rows': ok_rows,
        'ok_time_in_hours': ok_time_in_hours,
        'ok_percentage': ok_percentage,
        'acceptable_rows': acceptable_rows,
        'acceptable_time_in_hours': acceptable_time_in_hours,
        'acceptable_percentage': acceptable_percentage,
        'late_rows': late_rows,
        'late_time_in_hours': late_time_in_hours,
        'late_percentage': late_percentage,
        'early_workers': early_workers,
        'ok_workers': ok_workers,
        'acceptable_workers': acceptable_workers,
        'late_workers': late_workers,
        'min_date': min_date,
        'max_date': max_date,
        'filterable_fields': result['filterable_fields']
    }

def _create_worker_summary(self, df, filter_condition):
    worker_group = df[filter_condition].groupby('WorkerName').agg(
        entries=('WorkerName', 'size'),
        time_in_hours=('TimeInHs', 'sum')
    ).reset_index()

    worker_list = [
        {
            'worker': row['WorkerName'],
            'entries': row['entries'],
            'time_in_hours': row['time_in_hours']
        }
        for _, row in worker_group.sort_values('time_in_hours', ascending=False).iterrows()
    ]

    return worker_list