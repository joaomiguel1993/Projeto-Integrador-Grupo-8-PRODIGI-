from backend.repositories.utentes_repository import listar_utentes, obter_utente

def get_utentes_service():
    return listar_utentes()

def get_utente_service(num_utente: int):
    return obter_utente(num_utente)