from backend.repositories.hospitais_repository import listar_hospitais, obter_hospital

def get_hospitais_service():
    return listar_hospitais()

def get_hospital_service(id_hosp: int):
    return obter_hospital(id_hosp)