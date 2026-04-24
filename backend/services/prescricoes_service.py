from backend.repositories.prescricoes_repository import listar_prescricoes, obter_prescricao

def get_prescricoes_service():
    return listar_prescricoes()

def get_prescricao_service(id_prescricao: int):
    return obter_prescricao(id_prescricao)