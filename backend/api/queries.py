from ariadne import QueryType

query = QueryType()

@query.field("hello")
def resolve_hello(_, info):
    return "Olá, mundo!"

@query.field("exemplo")
def resolve_exemplo(_, info):
    return {"dados": "Estes são dados de exemplo da API GraphQL"}