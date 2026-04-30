from typing import Any, cast
from backend.dao.medicacaoativa_dao import (
    select_all_medicacaoativa,
    select_medicacaoativa_by_utente,
    insert_medicacaoativa,
    update_medicacaoativa,
    delete_medicacaoativa
)

def listar_medicacaoativa():
    result = select_all_medicacaoativa()
    if not result:
        return []
    return result

def listar_medicacaoativa_por_utente(numutent: int):
    result = select_medicacaoativa_by_utente(numutent)
    if not result:
        return []
    return result

def criar_medicacaoativa(numutent: int, codmedicamento: int, datainicio, datafim, dosagem):
    result = insert_medicacaoativa(numutent, codmedicamento, datainicio, datafim, dosagem)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def atualizar_medicacaoativa(codmedicacaoativa: int, datafim, dosagem):
    result = update_medicacaoativa(codmedicacaoativa, datafim, dosagem)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def remover_medicacaoativa(codmedicacaoativa: int):
    result = delete_medicacaoativa(codmedicacaoativa)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]