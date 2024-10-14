from datetime import datetime, timedelta, date
from models.helpers.weeks import Weeks
import globals

import pandas as pd

def resolve_week_review(_, info, date_of_interest):

    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
    
    df = globals.omni_datasets.timesheets.get_last_six_weeks(date_of_interest).data
    start, end = Weeks.get_week_dates(date_of_interest)

    result = {
        'sunday': TimesheetDateAnalysis(df, start),
        'monday': TimesheetDateAnalysis(df, start + timedelta(days=1)),
        'tuesday': TimesheetDateAnalysis(df, start + timedelta(days=2)),
        'wednesday': TimesheetDateAnalysis(df, start + timedelta(days=3)),
        'thursday': TimesheetDateAnalysis(df, start + timedelta(days=4)),
        'friday': TimesheetDateAnalysis(df, start + timedelta(days=5)),
        'saturday': TimesheetDateAnalysis(df, start + timedelta(days=6)),
    }

    return result

class TimesheetDateAnalysis:
    def __init__(self, df, date_of_interest: datetime, number_of_weeks: int = 6):
        day_of_week = date_of_interest.strftime('%A')

        kind_order = ['Consulting', 'HandsOn', 'Squad', 'Internal',]

        kinds_present = [kind for kind in kind_order if kind in df['Kind'].unique()]

        dates_of_interest = [(date_of_interest - timedelta(weeks=i)).date() for i in range(number_of_weeks)]
        dates_of_interest = [d for d in dates_of_interest if d.strftime('%A') == day_of_week]

        ds = df[df['DayOfWeek'] == day_of_week]
        self.daily_summary = ds.groupby(['Date', 'Kind'])['TimeInHs'].sum().unstack().fillna(0)

        all_dates_df = pd.DataFrame(0, index=dates_of_interest, columns=kinds_present)
        all_dates_df.index.name = 'Date'

        self.daily_summary = pd.concat([self.daily_summary, all_dates_df]).groupby('Date').sum().fillna(0)
        self.daily_summary = self.daily_summary.sort_index()

        # Convert daily_summary to a format compatible with DailySummaryEntry
        self.daily_summary = [
            {
                'date': date,
                'consulting': row.get('Consulting', 0.0),
                'hands_on': row.get('HandsOn', 0.0),
                'squad': row.get('Squad', 0.0),
                'internal': row.get('Internal', 0.0)
            }
            for date, row in self.daily_summary.iterrows()
        ]

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