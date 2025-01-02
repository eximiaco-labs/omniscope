from datetime import datetime

from omni_shared import globals

def resolve_allocation(root, info, start_date=None, end_date=None, filters=None):
    # Process dates
    def parse_date(date_input):
        if date_input is None:
            return datetime.now()
        if isinstance(date_input, str):
            return datetime.strptime(date_input, '%Y-%m-%d')
        return date_input

    start_date = parse_date(start_date)
    end_date = parse_date(end_date)

    # Get and filter timesheet data
    timesheet = globals.omni_datasets.timesheets.get(start_date, end_date)
    df, result = globals.omni_datasets.apply_filters(
        globals.omni_datasets.timesheets,
        timesheet.data,
        filters
    )

    # Define kind mappings
    kind_map = {
        'Consulting': 'consulting',
        'Internal': 'internal',
        'HandsOn': 'hands_on', 
        'Squad': 'squad'
    }

    # Initialize structure with empty lists for each kind
    by_kind = {normalized: [] for normalized in kind_map.values()}

    # Process allocations in one pass
    daily_allocation = df.groupby(['Date', 'Kind'])['TimeInHs'].sum()
    
    for (date, kind), hours in daily_allocation.items():
        if normalized_kind := kind_map.get(kind):
            by_kind[normalized_kind].append({
                'date': date.strftime('%Y-%m-%d'),
                'hours': float(hours)
            })

    return {
        'by_kind': by_kind,
        'filterable_fields': result['filterable_fields']
    }
