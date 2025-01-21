import calendar
from datetime import datetime, timedelta
from calendar import monthrange
import pandas as pd
from typing import Tuple

from omni_models.base.powerdataframe import SummarizablePowerDataFrame
from omni_models.datasets.insights_dataset import InsightsDataset
from omni_models.datasets.omni_dataset import OmniDataset
from omni_models.datasets.ontology_entries_dataset import OntologyEntriesDataset
from omni_models.datasets.tasks_dataset import TasksDataset
from omni_models.datasets.timesheet_dataset import TimesheetDataset
from omni_models.omnimodels import OmniModels

import omni_utils.helpers.slug as sl
from omni_utils.helpers.weeks import Weeks


def get_time_part_from_slug(slug: str) -> str:
    if slug.startswith('ontology-entries'):
        return slug[len('ontology-entries-'):]
    return slug.split('-', 1)[1]


def get_quarter_dates(quarter_slug: str) -> Tuple[datetime, datetime]:
    q, year = quarter_slug.split('-')
    year = int(year)
    quarter = int(q[1])

    quarter_months = {
        1: (1, 3),
        2: (4, 6),
        3: (7, 9),
        4: (10, 12)
    }

    start_month, end_month = quarter_months[quarter]

    start_date = datetime(year, start_month, 1, 0, 0, 0, 0)
    end_date = datetime(year, end_month, calendar.monthrange(year, end_month)[1], 23, 59, 59, 9999)

    return start_date, end_date

def get_semester_dates(semester_slug: str) -> Tuple[datetime, datetime]:
    q, year = semester_slug.split('-')
    year = int(year)
    quarter = int(q[1])

    semester_months = {
        1: (1, 6),
        2: (7, 12)
    }

    start_month, end_month = semester_months[quarter]

    start_date = datetime(year, start_month, 1, 0, 0, 0, 0)
    end_date = datetime(year, end_month, calendar.monthrange(year, end_month)[1], 23, 59, 59, 9999)

    return start_date, end_date

class OmniDatasets:
    def __init__(self, models: OmniModels = None):
        self.models = models
        self.timesheets = TimesheetDataset(models)
        self.ontology_entries = OntologyEntriesDataset(models)
        self.insights = InsightsDataset(models)
        self.tasks = TasksDataset(models)

    def get_dates(self, slug: str) -> Tuple[datetime, datetime]:
        if not slug:
            return None, None

        if slug.startswith('timesheet-') and len(slug.split('-')) == 7:
            parts = slug.split('-')
            start_day = int(parts[1])
            start_month = int(parts[2])
            start_year = int(parts[3])
            end_day = int(parts[4])
            end_month = int(parts[5])
            end_year = int(parts[6])

            start_date = datetime(start_year, start_month, start_day, 0, 0, 0, 0)
            end_date = datetime(end_year, end_month, end_day, 23, 59, 59, 9999)

            return start_date, end_date

        if slug.startswith('timesheet-') and len(slug.split('-')) == 5:
            parts = slug.split('-')
            start_day = int(parts[1])
            start_month = int(parts[2])
            end_day = int(parts[3])
            end_month = int(parts[4])

            current_year = datetime.now().year
            
            start_year = current_year
            end_year = current_year
            if start_month > end_month:
                end_year = current_year + 1

            start_date = datetime(start_year, start_month, start_day, 0, 0, 0, 0)
            end_date = datetime(end_year, end_month, end_day, 23, 59, 59, 9999)

            return start_date, end_date

        if slug.startswith('timesheet-month-'):
            parts = slug.split('-')
            year = int(parts[-2])
            month = int(parts[-1])

            first, last = monthrange(year, month)
            first_day = datetime(year, month, 1, 0, 0, 0, 0)
            last_day = datetime(year, month, last, 23, 59, 59, 9999)

            return first_day, last_day

        if slug.startswith('timesheet-last-six-weeks') and slug != 'timesheet-last-six-weeks':
            parts = slug.split('-')
            year = parts[-3]
            month = parts[-2]
            day = parts[-1]
            doi = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
            return None, None  # Special case handled by source.get_last_six_weeks(doi)

        if slug.startswith('timesheet-s'):
            semester_slug = get_time_part_from_slug(slug)
            return get_semester_dates(semester_slug)

        if slug.startswith('timesheet-q'):
            quarter_slug = get_time_part_from_slug(slug)
            return get_quarter_dates(quarter_slug)

        if slug.endswith('this-month'):
            now = datetime.now()
            start = datetime(now.year, now.month, 1, hour=0, minute=0, second=0, microsecond=0)
            end = datetime(
                now.year, now.month, calendar.monthrange(now.year, now.month)[1], 
                hour=23, minute=59, second=59, microsecond=9999
            )
            return start, end

        if slug.endswith('previous-month'):
            now = datetime.now()
            if now.month == 1:
                previous_month = 12
                year = now.year - 1
            else:
                previous_month = now.month - 1
                year = now.year
            start = datetime(year, previous_month, 1, hour=0, minute=0, second=0, microsecond=0)
            end = datetime(
                year, previous_month, calendar.monthrange(year, previous_month)[1],
                hour=23, minute=59, second=59, microsecond=9999
            )
            return start, end

        if slug.endswith('this-week'):
            start, end = Weeks.get_current_dates()
            return start, end

        if slug.endswith('previous-week'):
            start, end = Weeks.get_previous_dates(1)
            return start, end

        try:
            month, year = slug.split('-')[-2:]
            month = list(calendar.month_name).index(month.capitalize())
            year = int(year)
            first_day = datetime(year, month, 1, 0, 0, 0, 0)
            last_day = datetime(
                year, month, calendar.monthrange(year, month)[1], 
                23, 59, 59, 9999
            )
            return first_day, last_day
        except:
            return None, None
            
            
    def get_dataset_source_by_slug(self, slug: str) -> OmniDataset:
        if not slug:
            return None

        if slug.startswith('timesheet'):
            return self.timesheets
        elif slug.startswith('insights'):
            return self.insights
        elif slug.startswith('ontology-entries'):
            return self.ontology_entries
        elif slug.startswith('tasks'):
            return self.tasks
        else:
            return None

    def get_by_slug(self, slug: str) -> SummarizablePowerDataFrame:
        if not slug:
            return None

        source = self.get_dataset_source_by_slug(slug)
        if slug.startswith('timesheet-') and len(slug.split('-')) == 7:
            parts = slug.split('-')
            start_day = int(parts[1])
            start_month = int(parts[2])
            start_year = int(parts[3])
            end_day = int(parts[4])
            end_month = int(parts[5])
            end_year = int(parts[6])

            start_date = datetime(start_year, start_month, start_day, 0, 0, 0, 0)
            end_date = datetime(end_year, end_month, end_day, 23, 59, 59, 9999)

            return source.get(start_date, end_date)
        if slug.startswith('timesheet-') and len(slug.split('-')) == 5:
            parts = slug.split('-')
            start_day = int(parts[1])
            start_month = int(parts[2]) 
            end_day = int(parts[3])
            end_month = int(parts[4])

            current_year = datetime.now().year
            
            # If start month is greater than end month, it means we're crossing years
            start_year = current_year
            end_year = current_year
            if start_month > end_month:
                end_year = current_year + 1

            start_date = datetime(start_year, start_month, start_day, 0, 0, 0, 0)
            end_date = datetime(end_year, end_month, end_day, 23, 59, 59, 9999)

            return source.get(start_date, end_date)

        if slug.startswith('timesheet-month-'):
            parts = slug.split('-')
            year = int(parts[-2])
            month = int(parts[-1])

            first, last = monthrange(year, month)
            first_day = datetime(year, month, 1, 0,0,0,0)
            last_day = datetime(year, month, last, 23, 59, 59, 9999)

            return source.get(first_day, last_day)

        if slug.startswith('timesheet-last-six-weeks') and slug != 'timesheet-last-six-weeks':
            parts = slug.split('-')

            year = parts[-3]
            month = parts[-2]
            day = parts[-1]

            doi = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")

            return source.get_last_six_weeks(doi)
        elif slug.endswith('last-six-weeks'):
            return source.get_last_six_weeks()
        elif slug.endswith('all-tasks'):
            return source.get()
        elif slug.startswith('timesheet-s'):
            semester_slug = get_time_part_from_slug(slug)
            start, end = get_semester_dates(semester_slug)
            return source.get(start, end)
        elif slug.startswith('timesheet-q'):
            quarter_slug = get_time_part_from_slug(slug)
            start, end = get_quarter_dates(quarter_slug)
            return source.get(start, end)
        elif slug.endswith('this-semester'):
            now = datetime.now()
            slug = f"{('s1' if now.month <= 6 else 's2')}-{now.year}"
            start, end = get_semester_dates(slug)
            return source.get(start, end)
        elif slug.endswith('this-quarter'):
            now = datetime.now()
            current_month = now.month
            if current_month in [1, 2, 3]:
                slug = 'q1'
            elif current_month in [4, 5, 6]:
                slug = 'q2'
            elif current_month in [7, 8, 9]:
                slug = 'q3'
            else:
                slug = 'q4'

            slug = f'{slug}-{now.year}'
            start, end = get_quarter_dates(slug)
            return source.get(start, end)
        elif slug.endswith('this-month'):
            now = datetime.now()
            start = datetime(now.year, now.month, 1, hour=0, minute=0, second=0, microsecond=0)
            end = datetime(
                now.year, now.month, calendar.monthrange(now.year, now.month)[1], hour=23, minute=59, second=59,
                microsecond=9999
            )
            return source.get(start, end)
        elif slug.endswith('this-week'):
            start, end = Weeks.get_current_dates()
            return source.get(start, end)
        elif slug.endswith('previous-week'):
            start, end = Weeks.get_previous_dates(1)
            return source.get(start, end)
        elif slug.endswith('previous-month'):
            now = datetime.now()
            if now.month == 1:
                previous_month = 12
                year = now.year - 1
            else:
                previous_month = now.month - 1
                year = now.year
            start = datetime(year, previous_month, 1, hour=0, minute=0, second=0, microsecond=0)
            end = datetime(
                year, previous_month, calendar.monthrange(year, previous_month)[1], hour=23, minute=59, second=59,
                microsecond=9999
            )
            return source.get(start, end)

        month, year = slug.split('-')[-2:]
        month = list(calendar.month_name).index(month.capitalize())
        year = int(year)
        return source.get_specific_month(year, month)

    def get_datasets(self):
        result = [
            {'kind': 'Timesheet', 'name': 'Last Six Weeks'},
            {'kind': 'Timesheet', 'name': 'This Semester'},
            {'kind': 'Timesheet', 'name': 'This Quarter'},
            {'kind': 'Timesheet', 'name': 'This Month'},
            {'kind': 'Timesheet', 'name': 'Previous Month'},
            {'kind': 'Timesheet', 'name': 'This Week'},
            {'kind': 'Timesheet', 'name': 'Previous Week'}
        ]

        now = datetime.now()
        for i in range(1, 8):
            ws = Weeks.get_week_string(now - timedelta(days=i * 7))
            result.append({'kind': 'Timesheet', 'name': ws})

        current_year = now.year
        current_month = now.month

        # Loop to generate month-based entries for Timesheet
        while True:
            current_month -= 1
            if current_month == 0:
                current_month = 12
                current_year -= 1
            if current_year == 2023 and current_month < 7:
                break
            month_name = calendar.month_name[current_month]

            if current_month % 3 == 0:
                result.append({'kind': 'Timesheet', 'name': f'Q{current_month // 3} {current_year}'})

            if current_month % 6 == 0:
                result.append({'kind': 'Timesheet', 'name': f'S{current_month // 6} {current_year}'})

            result.append({'kind': 'Timesheet', 'name': f'{month_name} {current_year}'})

        kinds = ['Ontology Entries', 'Insights']
        year_limits = {'Ontology Entries': (2024, 3), 'Insights': (2024, 3)}

        # Loop to generate datasets for other kinds
        for kind in kinds:
            # Adding unique entries for each kind
            result.append({'kind': kind, 'name': 'Last Six Weeks'})
            result.append({'kind': kind, 'name': 'This Month'})
            result.append({'kind': kind, 'name': 'This Week'})
            result.append({'kind': kind, 'name': 'Previous Week'})

            # Reset current year and month
            current_year = now.year
            current_month = now.month

            # Generate historical month entries for each kind
            while True:
                current_month -= 1
                if current_month == 0:
                    current_month = 12
                    current_year -= 1
                if current_year == year_limits[kind][0] and current_month < year_limits[kind][1]:
                    break
                month_name = calendar.month_name[current_month]
                result.append({'kind': kind, 'name': f'{month_name} {current_year}'})

        # Final unique entry
        result.append({'kind': 'Tasks', 'name': 'All tasks'})

        # Add slugs to each dataset
        for dataset in result:
            dataset['slug'] = sl.generate(f"{dataset['kind']} - {dataset['name']}")

        return result

    def get_dataset_name_by_slug(self, slug):
        names = {
            sl.generate(f"{d['kind']} - {d['name']}"): d['name']
            for d in self.get_datasets()
        }
        return names.get(slug, None)

    def get_dataset_title_by_params(self, params: dict) -> str:
        dataset_slug = params['dataset_slug']
        result = [self.get_dataset_name_by_slug(dataset_slug)]
        for f in params['filter_values']:
            if f is not None:
                result.extend(f)

        return ', '.join(result)

    def get_dataset_source_by_params(self, params: dict) -> OmniDataset:
        dataset_slug = params['dataset_slug']
        return self.get_dataset_source_by_slug(dataset_slug)

    def get_by_params(self, params: dict) -> SummarizablePowerDataFrame:
        dataset_slug = params['dataset_slug']
        filter_values = params['filter_values']

        source = self.get_dataset_source_by_slug(dataset_slug)
        df = self.get_by_slug(dataset_slug)
        data: pd.DataFrame = df.data

        filterable_fields = source.get_filterable_fields()
        active_filters = dict(zip(filterable_fields, filter_values))

        for filter in filterable_fields:
            filter_value = active_filters.get(filter, None)

            if len(data) > 0:
                if filter_value:
                    data = data[data[filter].isin(filter_value)]

        return SummarizablePowerDataFrame(data)
    
    def apply_filters(self, 
                      source: OmniDataset, 
                      df: pd.DataFrame, 
                      filters: dict
                     ):
        
        # Compose filterable_fields and apply filters
        filterable_fields = source.get_filterable_fields()
        result = {'filterable_fields': []}

        for field in filterable_fields:
            options = []
            if len(df) > 0:
                options = sorted([value for value in df[field].unique().tolist() if value is not None])
            
            selected_values = []

            if filters:
                for filter_item in filters:
                    if filter_item['field'] == field:
                        selected_values = filter_item['selected_values'] if 'selected_values' in filter_item else filter_item['selectedValues']
                        break

            result['filterable_fields'].append(
                {
                    'field': field,
                    'selected_values': selected_values,
                    'options': options
                }
            )

            # Apply filter to dataframe
            if selected_values and len(df) > 0:
                df = df[df[field].isin(selected_values)]
        
        return df, result
