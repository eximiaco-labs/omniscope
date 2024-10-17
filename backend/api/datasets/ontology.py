import pandas as pd
from typing import Dict, Any, List, Union
from api.utils.fields import get_requested_fields_from

import globals

def summarize(df: pd.DataFrame) -> Dict[str, Any]:
    # Calculate statistics
    total_entries = len(df)
    unique_classes = df["ClassName"].nunique()
    unique_authors = df["AuthorId"].nunique()

    # Precompute groupby operations
    class_group = df.groupby("ClassName").size()
    author_group = df.groupby("AuthorId").size()

    return {
        "total_entries": total_entries,
        "unique_classes": unique_classes,
        "unique_authors": unique_authors,
        "average_entries_per_class": class_group.mean(),
        "std_dev_entries_per_class": class_group.std(),
        "average_entries_per_author": author_group.mean(),
        "std_dev_entries_per_author": author_group.std(),
    }

def summarize_by_class(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'ClassName')

def summarize_by_author(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    return summarize_by_group(df, 'AuthorName')

def summarize_by_group(df: pd.DataFrame, group_column: str, name_key: str = "name") -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    summaries = []
    for group_value, group_df in df.groupby(group_column):
        summary = summarize(group_df)
        summary[name_key] = group_value
        summaries.append(summary)

    summaries = sorted(summaries, key=lambda x: x["total_entries"], reverse=True)
    return summaries

def resolve_ontology(_, info, slug: str, requested_fields: List[str] = []) -> Dict[str, Any]:
    requested_fields = get_requested_fields_from(info)
    return compute_ontology(requested_fields, slug)

def compute_ontology(requested_fields: List[str], slug: str, filters = None) -> Dict[str, Any]:
    if not slug.startswith('ontology-entries'):
        slug = f'ontology-entries-{slug}'

    ontology = globals.omni_datasets.get_by_slug(slug)
    source = globals.omni_datasets.get_dataset_source_by_slug(slug)
    df = ontology.data

    # Compose filterable_fields and apply filters
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

    base_fields = set(requested_fields) - {'byClass', 'byAuthor'}
    if base_fields:
        result.update(summarize(df))

    if 'byClass' in requested_fields:
        result['by_class'] = summarize_by_class(df)

    if 'byAuthor' in requested_fields:
        result['by_author'] = summarize_by_author(df)

    return result


