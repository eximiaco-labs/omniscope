from omni_models.analytics import week_review

def resolve_week_review(_, info, date_of_interest, filters=None):
    return week_review.compute_week_review(date_of_interest, filters)

