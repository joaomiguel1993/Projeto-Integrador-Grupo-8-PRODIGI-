from backend.repositories.episodios_repository import listar_episodios, obter_episodio, criar_episodio

def get_episodios_service():
    return listar_episodios()

def get_episodio_service(cod_ep_urgenc: int):
    return obter_episodio(cod_ep_urgenc)

def criar_episodio_service(data):
    return criar_episodio(data.numutent, data.idhosp)
