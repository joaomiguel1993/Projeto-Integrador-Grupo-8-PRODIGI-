from backend.repositories.triagens_repository import listar_triagens, obter_triagem

def get_triagens_service():
    return listar_triagens()

def get_triagem_service(cod_ep_urgenc: int):
    return obter_triagem(cod_ep_urgenc)