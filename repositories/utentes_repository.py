from ..dao.utente_dao import get_utentes, get_utente, insert_utente

def listar_utentes():
    return get_utentes()

def obter_utente(numutent: int):
    return get_utente(numutent)

def criar_utente(numutent: int, sexo: str, localidade: str, idadeatual: int):
    return insert_utente(numutent, sexo, localidade, idadeatual)