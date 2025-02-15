from .models import Project, Case, Client, Sponsor, Summaries
from core.generator import generate_schema


def init():
    types = [Project, Case, Client, Sponsor, Summaries]
    schema = generate_schema(types, "Engagements", include_base_types=False)
    return schema
