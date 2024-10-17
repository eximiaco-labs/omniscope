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
    summaries = []
    for class_name, class_df in df.groupby("ClassName"):
        authors = class_df.groupby("AuthorName").size().reset_index(name="entries")
        authors = authors.sort_values("entries", ascending=False)
        authors = authors.rename(columns={"AuthorName": "name"}).to_dict("records")

        summary = {
            "name": class_name,
            "total_entries": len(class_df),
            "unique_authors": len(authors),
            "average_entries_per_author": class_df.groupby("AuthorId").size().mean(),
            "std_dev_entries_per_author": class_df.groupby("AuthorId").size().std(),
            "authors": authors
        }
        summaries.append(summary)

    return sorted(summaries, key=lambda x: x["total_entries"], reverse=True)

def summarize_by_author(df: pd.DataFrame) -> List[Dict[str, Union[Dict[str, Any], Any]]]:
    summaries = []
    for author_name, author_df in df.groupby("AuthorName"):
        classes = author_df.groupby("ClassName").size().reset_index(name="entries")
        classes = classes.sort_values("entries", ascending=False)
        classes = classes.rename(columns={"ClassName": "name"}).to_dict("records")

        summary = {
            "name": author_name,
            "total_entries": len(author_df),
            "unique_classes": len(classes),
            "average_entries_per_class": author_df.groupby("ClassName").size().mean(),
            "std_dev_entries_per_class": author_df.groupby("ClassName").size().std(),
            "classes": classes
        }
        summaries.append(summary)

    return sorted(summaries, key=lambda x: x["total_entries"], reverse=True)

def resolve_ontology(_, info, slug: str, filters = None) -> Dict[str, Any]:
    requested_fields = get_requested_fields_from(info)
    return compute_ontology(requested_fields, slug, filters)

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
