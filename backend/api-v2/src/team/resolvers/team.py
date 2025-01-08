from ..models import get_account_managers, get_consultants, get_engineers

def resolve_team(*_):
    return {}

def resolve_team_account_managers(obj, info):
    return [
        manager.model_dump()
        for manager in get_account_managers()
    ]

def resolve_team_consultants(obj, info):
    return [
        consultant.model_dump()
        for consultant in get_consultants()
    ]

def resolve_team_engineers(obj, info):
    return [
        engineer.model_dump()
        for engineer in get_engineers()
    ] 