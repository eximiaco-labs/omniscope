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