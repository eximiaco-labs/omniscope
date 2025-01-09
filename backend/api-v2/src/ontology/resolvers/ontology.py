from ariadne import QueryType, ObjectType
from core.decorators import collection
from ..models import Class

from omni_shared import globals

query = QueryType()
ontology = ObjectType("Ontology")

def convert_ontology_class_to_model(c):
    return Class(
        id=c.slug,
        slug=c.slug,    
        name=c.name,
        description=c.description
    )

@query.field("ontology")
def resolve_ontology(*_):
    return {}

@ontology.field("classes")
@collection
def resolve_classes(obj, info):
    classes = globals.omni_models.ontology.classes
    return [convert_ontology_class_to_model(c) for c in classes]

@ontology.field("class")
def resolve_class(obj, info, id: str = None, slug: str = None):
    classes = globals.omni_models.ontology.classes
    if id is not None:
        ontology_class   = next((c for c in classes if c.slug == id), None)
    elif slug is not None:
        ontology_class = next((c for c in classes if c.slug == slug), None)
    return convert_ontology_class_to_model(ontology_class)