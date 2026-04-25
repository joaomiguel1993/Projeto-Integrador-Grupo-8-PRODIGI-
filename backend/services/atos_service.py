from datetime import datetime
from backend.repositories.atos_repository import (
    listar_atos,
    obter_ato,
    listar_atos_por_episodio,
    criar_ato,
    listar_funcionarios_do_ato,
    listar_prescricoes_do_ato
)

def get_atos_service():
    return listar_atos()

def get_ato_service(id_ato: int):
    return obter_ato(id_ato)

def get_atos_por_episodio_service(cod_ep_urgenc: int):
    return listar_atos_por_episodio(cod_ep_urgenc)

def criar_ato_service(data):
    data_hora_inicio = data.datahorainicio or datetime.now()
    return criar_ato(
        cod_ep_urgenc=data.codepurgenc,
        tipo=data.tipo,
        descricao=data.descricao,
        data_hora_inicio=data_hora_inicio
    )

def get_funcionarios_do_ato_service(id_ato: int):
    return listar_funcionarios_do_ato(id_ato)

def get_prescricoes_do_ato_service(id_ato: int):
    return listar_prescricoes_do_ato(id_ato)
