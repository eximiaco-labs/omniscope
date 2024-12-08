from datetime import datetime
import calendar

from models.analytics.revenue_tracking import compute_revenue_tracking

def get_same_day_one_month_ago(date_of_interest):
    d = date_of_interest.day
    if date_of_interest.month == 1:
        y = date_of_interest.year - 1
        m = 12
    else:
        y = date_of_interest.year
        m = date_of_interest.month - 1

    last_day = calendar.monthrange(y, m)[1]
    if d > last_day:
        d = last_day

    return datetime(y, m, d, 23, 59, 59, 999999)

def get_last_day_of_month(date_of_interest):
    y = date_of_interest.year
    m = date_of_interest.month
    last_day = calendar.monthrange(y, m)[1]
    return datetime(y, m, last_day, 23, 59, 59, 999999)

def compute_forecast(date_of_interest = None, filters = None):
    if date_of_interest is None:
        date_of_interest = datetime.now()

    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
        
    # Dates
    
    same_day_last_month = get_same_day_one_month_ago(date_of_interest)
    last_day_of_last_month = get_last_day_of_month(same_day_last_month)
    
    same_day_two_months_ago = get_same_day_one_month_ago(same_day_last_month)
    last_day_of_two_months_ago = get_last_day_of_month(same_day_two_months_ago)
    
    same_day_three_months_ago = get_same_day_one_month_ago(same_day_two_months_ago)
    last_day_of_three_months_ago = get_last_day_of_month(same_day_three_months_ago)
    
    # Revenue tracking
    
    analysis_date_of_interest = compute_revenue_tracking(date_of_interest, filters=filters)
    
    analysis_same_day_last_month = compute_revenue_tracking(same_day_last_month, filters=filters)
    analysis_last_day_of_last_month = compute_revenue_tracking(last_day_of_last_month, filters=filters)
    
    analysis_same_day_two_months_ago = compute_revenue_tracking(same_day_two_months_ago, filters=filters)
    analysis_last_day_of_two_months_ago = compute_revenue_tracking(last_day_of_two_months_ago, filters=filters)
    
    analysis_same_day_three_months_ago = compute_revenue_tracking(same_day_three_months_ago, filters=filters)
    analysis_last_day_of_three_months_ago = compute_revenue_tracking(last_day_of_three_months_ago, filters=filters)

        
    def summarize_forecast(slug):
        clients = {}
        
        def add_context(context, context_slug):
            for client in context['summaries']['by_client']:
                if client.slug not in clients:
                    clients[client.slug] = {
                        'name': client.name,
                        'slug': client.slug,
                    }

                working_client = clients[client.slug]
                working_client[context_slug] = client.get_fee(slug)
        
        add_context(analysis_date_of_interest, 'in_analysis')
        add_context(analysis_last_day_of_last_month, 'one_month_ago')
        add_context(analysis_last_day_of_two_months_ago, 'two_months_ago')
        add_context(analysis_last_day_of_three_months_ago, 'three_months_ago')
        
        if slug == 'consulting':
            add_context(analysis_same_day_last_month, 'same_day_one_month_ago')
            add_context(analysis_same_day_two_months_ago, 'same_day_two_months_ago')
            add_context(analysis_same_day_three_months_ago, 'same_day_three_months_ago')
            
        by_client = list(clients.values())
        by_client = [
            client for client in by_client 
            if client.get('in_analysis', 0) > 0 
            or client.get('one_month_ago', 0) > 0
            or client.get('two_months_ago', 0) > 0 
            or client.get('three_months_ago', 0) > 0
        ]
        
        for client in by_client:
            client['in_analysis'] = client.get('in_analysis', 0)
            client['one_month_ago'] = client.get('one_month_ago', 0)
            client['two_months_ago'] = client.get('two_months_ago', 0)
            client['three_months_ago'] = client.get('three_months_ago', 0)
            if slug == 'consulting':
                client['same_day_one_month_ago'] = client.get('same_day_one_month_ago', 0)
                client['same_day_two_months_ago'] = client.get('same_day_two_months_ago', 0)
                client['same_day_three_months_ago'] = client.get('same_day_three_months_ago', 0)
                
                current_day = date_of_interest.day
                days_in_month = calendar.monthrange(date_of_interest.year, date_of_interest.month)[1]
                client['projected'] = (client['in_analysis'] / current_day) * days_in_month
                
                previous_value = client.get('one_month_ago', 0)
                two_months_ago_value = client.get('two_months_ago', 0)
                three_months_ago_value = client.get('three_months_ago', 0)
                
                if previous_value == 0 and two_months_ago_value == 0 and three_months_ago_value == 0:
                    client['expected'] = client['projected']
                elif two_months_ago_value == 0 and three_months_ago_value == 0:
                    client['expected'] = previous_value
                elif three_months_ago_value == 0:
                    client['expected'] = previous_value * 0.8 + two_months_ago_value * 0.2
                else:
                    client['expected'] = previous_value * 0.6 + two_months_ago_value * 0.25 + three_months_ago_value * 0.15
        
        totals = {
            'in_analysis': sum(client.get('in_analysis', 0) for client in by_client),
            'one_month_ago': sum(client.get('one_month_ago', 0) for client in by_client),
            'two_months_ago': sum(client.get('two_months_ago', 0) for client in by_client),
            'three_months_ago': sum(client.get('three_months_ago', 0) for client in by_client),
        }
        if slug == 'consulting':
            totals['same_day_one_month_ago'] = sum(client.get('same_day_one_month_ago', 0) for client in by_client)
            totals['same_day_two_months_ago'] = sum(client.get('same_day_two_months_ago', 0) for client in by_client)
            totals['same_day_three_months_ago'] = sum(client.get('same_day_three_months_ago', 0) for client in by_client)
            totals['projected'] = sum(client.get('projected', 0) for client in by_client)
            totals['expected'] = sum(client.get('expected', 0) for client in by_client) 

        return {
            'slug': slug,
            'by_client': by_client,
            'totals': totals
        }
    
    filterable_fields = []
    
    # Combine all filterable fields from each analysis
    for field_list in [
        analysis_date_of_interest['filterable_fields'],
        analysis_last_day_of_last_month['filterable_fields'],
        analysis_last_day_of_two_months_ago['filterable_fields'],
        analysis_last_day_of_three_months_ago['filterable_fields']
    ]:
        for field in field_list:
            # Check if field already exists
            existing = next((f for f in filterable_fields if f['field'] == field['field']), None)
            
            if existing:
                # Merge options and selected values
                existing['options'] = sorted(list(set(existing['options'] + field['options'])))
                existing['selected_values'] = sorted(list(set(existing['selected_values'] + field['selected_values'])))
            else:
                # Add new field
                filterable_fields.append(field.copy())
    
    return {
        "date_of_interest": date_of_interest,
        "dates": {
            "same_day_one_month_ago": same_day_last_month,
            "one_month_ago": last_day_of_last_month,
            "same_day_two_months_ago": same_day_two_months_ago,
            "two_months_ago": last_day_of_two_months_ago,
            "same_day_three_months_ago": same_day_three_months_ago,
            "three_months_ago": last_day_of_three_months_ago
        },
        "by_kind": {
        
            "consulting": summarize_forecast('consulting'),
            "consulting_pre": summarize_forecast('consulting_pre'),
            "hands_on": summarize_forecast('hands_on'),
            "squad": summarize_forecast('squad')
        },
        "filterable_fields": filterable_fields
    }


    