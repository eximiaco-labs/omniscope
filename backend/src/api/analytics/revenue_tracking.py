import globals

from datetime import date, datetime

def resolve_revenue_tracking(root, info, date_of_interest: str | date):
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, "%Y-%m-%d").date()

    year = date_of_interest.year
    month = date_of_interest.month

    active_cases = [
        case
        for case in globals.omni_models.cases.get_all().values()
        if case.is_active
    ]

    by_case = []
    for case in active_cases:
        if case.fixed_fee != 0:
            by_case.append({
                "title": case.title,
                "fee": case.fixed_fee,
                "by_project": [
                    {
                        "kind": project.kind,
                        "name": project.name,
                        "fee": project.billing.fee
                    }
                    for project in case.tracker_info
                    if project.billing and project.billing.fee and project.billing.fee != 0
                ]
            })

    return {
        "year": year,
        "month": month,
        "fixed": { 
            "monthly": { 
                "total": sum(case["fee"] for case in by_case), 
                "by_case": by_case 
            } 
        }
    }
