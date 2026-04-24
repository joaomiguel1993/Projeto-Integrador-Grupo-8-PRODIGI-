from backend.repositories.medicamentos_repository import listar_medicamentos, obter_medicamento

def get_medicamentos_service():
    return listar_medicamentos()

def get_medicamento_service(cod_medicamento: int):
    return obter_medicamento(cod_medicamento)