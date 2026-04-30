from backend.repositories.hospitais_repository import listar_hospitais, obter_hospital

def get_hospitais_service():
    return listar_hospitais()

def get_hospital_service(id_hosp: int):
    return obter_hospital(id_hosp)

def criar_hospital_service(nome: str, localizacao: str):
    return criar_hospital(nome, localizacao)

def remover_hospital_service(id_hosp: int):
    return remover_hospital(id_hosp)