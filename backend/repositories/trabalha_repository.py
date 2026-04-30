from typing import Any, cast
from backend.dao.trabalha_dao import (
    select_funcionarios_by_hospital,
    select_hospitais_by_funcionario,
    insert_trabalha,
    update_trabalha_ativo,
    delete_trabalha
)

def listar_funcionarios_do_hospital(idhosp: int):
    result = select_funcionarios_by_hospital(idhosp)
    if not result:
        return []
    return result

def listar_hospitais_do_funcionario(idfunc: int):
    result = select_hospitais_by_funcionario(idfunc)
    if not result:
        return []
    return result

def criar_trabalha(idfunc: int, idhosp: int):
    result = insert_trabalha(idfunc, idhosp)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def atualizar_trabalha_ativo(idfunc: int, idhosp: int, ativo: bool):
    result = update_trabalha_ativo(idfunc, idhosp, ativo)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def remover_trabalha(idfunc: int, idhosp: int):
    result = delete_trabalha(idfunc, idhosp)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]