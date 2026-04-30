from typing import Any, cast
from backend.dao.alerta_dao import (
    select_all_alertas,
    select_alerta_by_id,
    select_alertas_by_prescricao,
    insert_alerta,
    update_alerta_ignorado
)

def listar_alertas():
    result = select_all_alertas()
    if not result:
        return []
    return result

def obter_alerta(codalerta: int):
    result = select_alerta_by_id(codalerta)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def listar_alertas_por_prescricao(idprescricao: int):
    result = select_alertas_by_prescricao(idprescricao)
    if not result:
        return []
    return result

def criar_alerta(idprescricao: int, idfunc, tipo: str):
    result = insert_alerta(idprescricao, idfunc, tipo)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def atualizar_alerta_ignorado(codalerta: int, ignorado: bool, justificacao):
    result = update_alerta_ignorado(codalerta, ignorado, justificacao)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]