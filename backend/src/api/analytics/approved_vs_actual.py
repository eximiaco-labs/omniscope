import pandas as pd
from datetime import datetime

from models.helpers.weeks import Weeks

import globals

def resolve_approved_vs_actual(_, info, start, end):
    # Call compute_raw_data to get the raw data
    raw_data = compute_raw_data(start, end)

    # Initialize a dictionary to store unique cases
    unique_cases = {}

    # Iterate through each week in the raw data
    for week in raw_data['weeks']:
        # Iterate through each case in the week's data
        for case in week['data']:
            case_id = case['id']
            if case_id not in unique_cases:
                unique_cases[case_id] = {
                    'id': case_id,
                    'title': case['title'],
                    'start_of_contract': case['start_of_contract'],
                    'end_of_contract': case['end_of_contract'],
                    'weekly_approved_hours': case['weekly_approved_hours'],
                    'pre_contracted_value': case['pre_contracted_value'],
                    'weeks': []
                }
            
            # Add week data to the case
            unique_cases[case_id]['weeks'].append({
                'title': week['title'],
                'number_of_days': case['number_of_days'],
                'approved_hours': case['approved_hours'],
                'actual_hours': case['actual'],
                'difference': case['actual'] - case['approved_hours']
            })

    # Convert the dictionary of unique cases to a list
    all_cases = list(unique_cases.values())
    for case in all_cases:
        # Calculate sums for approved_hours, actual, and difference
        case['total_approved_hours'] = sum(week['approved_hours'] for week in case['weeks'])
        case['total_actual_hours'] = sum(week['actual_hours'] for week in case['weeks'])
        case['total_difference'] = sum(week['difference'] for week in case['weeks'])


    # Sort the list of cases by total difference in descending order
    all_cases.sort(key=lambda x: x['total_difference'])

    # Filter out cases that are not active or have no actual hours
    all_cases = [
        case 
        for case in all_cases 
        if globals.omni_models.cases.get_by_id(case['id']).is_active or case['total_actual_hours'] > 0
    ]

    # Return the result as a dictionary
    return {
        'start': raw_data['start'],
        'end': raw_data['end'],
        'total_approved_hours': sum(case['total_approved_hours'] for case in all_cases),
        'total_actual_hours': sum(case['total_actual_hours'] for case in all_cases),
        'total_difference': sum(case['total_difference'] for case in all_cases),
        'number_of_cases': len(all_cases),
        'cases': all_cases
    }


def compute_raw_data(start, end):
    if isinstance(start, str):
        start = datetime.fromisoformat(start)
        
    if isinstance(end, str):
        end = datetime.fromisoformat(end)
    
    s, ew = Weeks.get_week_dates(start)
    _, e = Weeks.get_week_dates(end)

    result = {
        'start': s.isoformat(),
        'end': e.isoformat(),
        'weeks': []
    }

    while s < e:
        cases = ActiveCasesWithApprovedHours(s, ew)
        timesheet = ConsultingTimesheet(s, ew)
        df = cases.to_dataframe(timesheet)
        
        df['start_of_week'] = df['start_of_contract'].apply(lambda x: max(s, x) if pd.notna(x) else s)
        df['end_of_week'] = df['end_of_contract'].apply(lambda x: min(ew, x) if pd.notna(x) else ew)
        df['number_of_days'] = (df['end_of_week'] - df['start_of_week']).dt.days + 1
        df['approved_hours'] = df['weekly_approved_hours'] * df['number_of_days'] / 7
        
        df['start_of_contract'] = df['start_of_contract'].apply(lambda x: None if pd.isna(x) or x is pd.NaT else x)
        df['end_of_contract'] = df['end_of_contract'].apply(lambda x: None if pd.isna(x) or x is pd.NaT else x)
        
        # Convert datetime columns to ISO format strings
        df['start_of_week'] = df['start_of_week'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['end_of_week'] = df['end_of_week'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['start_of_contract'] = df['start_of_contract'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        df['end_of_contract'] = df['end_of_contract'].apply(lambda x: x.isoformat() if pd.notna(x) else None)
        
        week_data = df.to_dict(orient='records')
        
        result['weeks'].append({
            'start': s.isoformat(),
            'end': ew.isoformat(),
            'title': Weeks.get_week_string(s),
            'data': week_data
        })

        s = ew + pd.Timedelta(days=1)
        s, ew = Weeks.get_week_dates(s)

    return result


class ActiveCasesWithApprovedHours:
    def __init__(self, start_date, end_date):
        self.cases = globals.omni_models.cases.get_live_cases_with_approved_hours(start_date, end_date)

    def __iter__(self):
        return iter(self.cases)


    def to_dataframe(self, consulting_timesheet=None):
        df = pd.DataFrame([{
            'client_id': case.client_id,
            'id': case.id,
            'title': case.title,
            'start_of_contract': case.start_of_contract,
            'end_of_contract': case.end_of_contract,
            'weekly_approved_hours': case.weekly_approved_hours,
            'is_active': case.is_active,
            'pre_contracted_value': case.pre_contracted_value
        } for case in self.cases])
        
        df['start_of_contract'] = pd.to_datetime(df['start_of_contract'])
        df['end_of_contract'] = pd.to_datetime(df['end_of_contract'])
        
        if consulting_timesheet:
            summary = consulting_timesheet.summarize()
            if (len(summary) != 0):
                df = pd.merge(df, summary, on='id', how='left')
                df['actual'] = df['actual'].fillna(0)
            else:
                df['actual'] = 0
        
        return df

class ConsultingTimesheet:
    def __init__(self, start, end):
        self.start = start
        self.end = end
        self.timesheet_df = self._get_consulting_timesheet_data()

    def _get_consulting_timesheet_data(self):
        timesheet = globals.omni_datasets.timesheets.get(self.start, self.end)
        timesheet_df = timesheet.data
        if len(timesheet_df) != 0:
            timesheet_df = timesheet_df[timesheet_df['Kind'] == 'Consulting']
        return timesheet_df
    
    def summarize(self):
        if len(self.timesheet_df) == 0:
            return pd.DataFrame()

        summary = self.timesheet_df.groupby(['CaseId'])['TimeInHs'].sum().reset_index()
        return summary.rename(columns={
            'CaseId': 'id',
            'TimeInHs': 'actual'
        })

    def __iter__(self):
        return iter(self.timesheet_df.itertuples(index=False))

    @property
    def data(self):
        return self.timesheet_df