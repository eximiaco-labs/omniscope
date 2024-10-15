from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from models.helpers.weeks import Weeks
import globals

import pandas as pd

def resolve_week_review(_, info, date_of_interest, filters=None):
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
        
        result['filterable_fields'].append({
            'field': field,
            'selected_values': selected_values,
            'options': options
        })
        
        # Apply filter to dataframe
        if selected_values:
            df = df[df[field].isin(selected_values)]

    week_days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for i, day in enumerate(week_days):
        result[day] = TimesheetDateAnalysis(df, start + timedelta(days=i))

    # Add month summary
    result['month_summary'] = calculate_month_summary(df, date_of_interest, filters)

    return result

def calculate_month_summary(six_weeks_df, date_of_interest, filters=None):
    current_month = date_of_interest.replace(day=1)
    previous_month = (current_month - relativedelta(months=1))

    # Get previous month data
    previous_month_slug = f'timesheet-month-{previous_month.year}-{previous_month.month}'
    timesheet_previous_month = globals.omni_datasets.get_by_slug(previous_month_slug)
    df = timesheet_previous_month.data
    
    # Apply filters if any
    if filters:
        for filter_item in filters:
            df = df[df[filter_item['field']].isin(filter_item['selected_values'])]

    previous_month = df
    
    # Convert 'Date' column to datetime if not already
    six_weeks_df['Date_'] = pd.to_datetime(six_weeks_df['Date'])

    this_month = six_weeks_df[
        (six_weeks_df['Date_'] <= date_of_interest) &
        (six_weeks_df['Date_'] >= date_of_interest.replace(day=1))
    ]
    
    # Calculate required values
    hours_this_month = this_month['TimeInHs'].sum()
    hours_previous_month = previous_month['TimeInHs'].sum()
    
    limit_date = date_of_interest - relativedelta(months=1)
    previous_month['Date_'] = pd.to_datetime(previous_month['Date'])
    hours_until_this_date = previous_month[previous_month['Date_'] <= limit_date]['TimeInHs'].sum()
    
    return {
        'hours_this_month': hours_this_month,
        'hours_previous_month': hours_previous_month,
        'hours_previous_month_until_this_date': hours_until_this_date,
        'limit_date': limit_date
    }

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
