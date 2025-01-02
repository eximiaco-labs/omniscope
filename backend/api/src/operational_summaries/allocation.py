from datetime import datetime

def resolve_allocation(root, info, start_date, end_date, filters):
    if start_date is None:
        start_date = datetime.now()
    elif isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        
    if end_date is None:
        end_date = datetime.now()
    elif isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
        