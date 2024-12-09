from omni_shared import globals


def resolve_projects(_, info):
    return list(globals.omni_models.projects.get_all().values())

