from ariadne import QueryType, ObjectType
from core.decorators import collection

query = QueryType()
ontology = ObjectType("Ontology")

@query.field("ontology")
def resolve_ontology(*_):
    return {}

@ontology.field("classes")
@collection
def resolve_classes(obj, info, filter=None, sort=None, pagination=None):
    return []