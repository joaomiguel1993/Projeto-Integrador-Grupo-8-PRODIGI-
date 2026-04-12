from ..dao.ato_dao import get_atos_todos, get_atos_episodio, insert_ato_basico

def listar_atos():
    return get_atos_todos()

def listar_atos_episodio(cod: int, nomehosp: str):
    return get_atos_episodio(cod, nomehosp)

def criar_ato_basico(cod: int, nomehosp: str, datahorainicio: str, tipo: str):
    return insert_ato_basico(cod, nomehosp, datahorainicio, tipo)