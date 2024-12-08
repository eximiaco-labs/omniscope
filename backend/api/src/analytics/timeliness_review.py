from models.analytics import compute_timeliness_review

def resolve_timeliness_review(_, info, date_of_interest, filters=None):
    return compute_timeliness_review(date_of_interest, filters)