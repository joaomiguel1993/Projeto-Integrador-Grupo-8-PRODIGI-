from ..dao.hospital_dao import get_hospitais, get_hospital, insert_hospital

def listar_hospitais():
    return get_hospitais()

def obter_hospital(nome: str):
    return get_hospital(nome)

def criar_hospital(nome: str, localizacao: str):
    return insert_hospital(nome, localizacao)