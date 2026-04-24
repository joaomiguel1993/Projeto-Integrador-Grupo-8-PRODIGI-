from backend.repositories.profissionais_repository import listar_profissionais, obter_profissional

def get_profissionais_service():
    return listar_profissionais()

def get_profissional_service(id_func: int):
    return obter_profissional(id_func)