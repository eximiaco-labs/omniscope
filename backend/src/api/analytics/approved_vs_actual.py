from models.analytics import compute_approved_vs_actual

def resolve_approved_vs_actual(_, info, start, end):
    return compute_approved_vs_actual(start, end)