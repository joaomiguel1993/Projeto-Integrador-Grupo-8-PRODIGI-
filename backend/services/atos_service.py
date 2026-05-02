from datetime import datetime
from backend.repositories.atos_repository import *

def get_atos_service(): return listar_atos()
def get_ato_service(id): return obter_ato(id)
def get_atos_por_episodio_service(cod): return listar_atos_por_episodio(cod)
def get_funcionarios_do_ato_service(id): return listar_funcionarios_do_ato(id)
def get_prescricoes_do_ato_service(id): return listar_prescricoes_do_ato(id)

def criar_ato_service(data):
    return criar_ato(data.codepurgenc, data.tipo, data.descricao, data.datahorainicio or datetime.now())

def atualizar_ato_service(id, data):
    return atualizar_ato(id, data.tipo, data.descricao, data.datahorafim)