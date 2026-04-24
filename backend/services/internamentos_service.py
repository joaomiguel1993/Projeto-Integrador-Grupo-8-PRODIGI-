from backend.repositories.internamentos_repository import listar_internamentos, obter_internamento

def get_internamentos_service():
    return listar_internamentos()

def get_internamento_service(cod_internamento: int):
    return obter_internamento(cod_internamento)