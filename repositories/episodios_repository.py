from ..dao.episodio_dao import get_episodios_todos, get_episodios_hospital, get_episodio, insert_episodio

def listar_episodios():
    return get_episodios_todos()

def listar_episodios_hospital(nomehosp: str):
    return get_episodios_hospital(nomehosp)

def obter_episodio(cod: int, nomehosp: str):
    return get_episodio(cod, nomehosp)

def criar_episodio(cod: int, nomehosp: str, numutent: int, datahoraentr: str):
    return insert_episodio(cod, nomehosp, numutent, datahoraentr)