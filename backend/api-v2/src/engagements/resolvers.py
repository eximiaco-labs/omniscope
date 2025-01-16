from ariadne import QueryType, ObjectType
from .models import Client, Sponsor, Case, Project
from core.decorators import collection
from omni_shared import globals

query = QueryType()
engagements = ObjectType("Engagements")
client = ObjectType("Client")
sponsor = ObjectType("Sponsor")
case = ObjectType("Case")
project = ObjectType("Project")

engagements_resolvers = [query, engagements, client, sponsor, case, project]

@query.field("engagements")
def resolve_engagements(*_):
    return {}

@engagements.field("clients")
@collection
def resolve_engagements_clients(obj, info):
    source = globals.omni_models.clients.get_all().values()
    return [Client.from_domain(client) for client in source]

@engagements.field("client")
def resolve_engagements_client(obj, info, id: str = None, slug: str = None):
    if id is not None:
        client = globals.omni_models.clients.get_by_id(int(id))
    elif slug is not None:
        client = globals.omni_models.clients.get_by_slug(slug)
    else:
        return None
        
    if not client:
        return None
        
    return Client.from_domain(client).model_dump()

@engagements.field("sponsors")
@collection
def resolve_engagements_sponsors(obj, info):
    source = globals.omni_models.sponsors.get_all().values()
    return [Sponsor.from_domain(sponsor) for sponsor in source]

@engagements.field("sponsor")
def resolve_engagements_sponsor(obj, info, id: str = None, slug: str = None):
    if id is not None:
        sponsor = globals.omni_models.sponsors.get_by_id(int(id))
    elif slug is not None:
        sponsor = globals.omni_models.sponsors.get_by_slug(slug)
    else:
        return None
        
    if not sponsor:
        return None
        
    return Sponsor.from_domain(sponsor).model_dump()

@engagements.field("cases")
@collection
def resolve_engagements_cases(obj, info):
    source = globals.omni_models.cases.get_all().values()
    return [Case.from_domain(case) for case in source]

@engagements.field("case")
def resolve_engagements_case(obj, info, id: str = None, slug: str = None):
    if id is not None:
        case = globals.omni_models.cases.get_by_id(id)
    elif slug is not None:
        case = globals.omni_models.cases.get_by_slug(slug)
    else:
        return None
        
    if not case:
        return None
        
    return Case.from_domain(case).model_dump()

@engagements.field("projects")
@collection
def resolve_engagements_projects(obj, info):
    source = globals.omni_models.tracker.all_projects.values()
    return [Project.from_domain(project) for project in source]

@engagements.field("project")
def resolve_engagements_project(obj, info, id: str = None, slug: str = None):
    if id is not None:
        project = globals.omni_models.tracker.get_project_by_id(id)
    elif slug is not None:
        project = globals.omni_models.tracker.get_project_by_slug(slug)
    else:
        return None
        
    if not project:
        return None
        
    return Project.from_domain(project).model_dump()
