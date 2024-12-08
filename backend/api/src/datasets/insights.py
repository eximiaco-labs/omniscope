import pandas as pd
from typing import Dict, Any, List
from utils.fields import get_requested_fields_from

import globals


def summarize(df: pd.DataFrame) -> Dict[str, Any]:
    # Calculate statistics
    total_entries = len(df)
    unique_authors = df["WorkerName"].nunique() if len(df) > 0 else 0
    author_group = df.groupby("WorkerName").size() if len(df) > 0 else None

    return {
        "total_entries": total_entries,
        "unique_authors": unique_authors,
        "average_entries_per_author": author_group.mean() if author_group is not None else 0,
        "std_dev_entries_per_author": author_group.std() if author_group is not None else 0,
    }

def summarize_by_author(df: pd.DataFrame) -> List[Dict[str, int]]:
    if len(df) == 0:
        return []

    author_counts = df['WorkerName'].value_counts().reset_index()
    author_counts.columns = ['WorkerName', 'count']
    return [{'name': row['WorkerName'], 'entries': row['count']} for _, row in author_counts.iterrows()]

def resolve_insights(_, info, slug: str, filters = None) -> Dict[str, Any]:
    requested_fields = get_requested_fields_from(info)
    return compute_insights(requested_fields, slug, filters)

def compute_insights(requested_fields: List[str], slug: str, filters = None) -> Dict[str, Any]:
    if not slug.startswith('insights-'):
        slug = f'insights-{slug}'

    insights = globals.omni_datasets.get_by_slug(slug)
    source = globals.omni_datasets.get_dataset_source_by_slug(slug)
    df = insights.data

    # Compose filterable_fields and apply filters
    filterable_fields = source.get_filterable_fields()
    result = {'filterable_fields': []}
    
    for field in filterable_fields:
        if len(df) > 0:
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

    base_fields = set(requested_fields) - {'byAuthor'}
    if base_fields:
        result.update(summarize(df))

    if 'byAuthor' in requested_fields:
        result['by_author'] = summarize_by_author(df)

    return result
