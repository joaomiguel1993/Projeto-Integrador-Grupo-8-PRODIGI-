from typing import Any, cast
from backend.dao.utenteantecedente_dao import (
    select_antecedentes_by_utente,
    insert_utenteantecedente,
    delete_utenteantecedente
)

def listar_antecedentes_do_utente(numutent: int):
    result = select_antecedentes_by_utente(numutent)
    if not result:
        return []
    return result

def adicionar_antecedente(numutent: int, codantecedente: int):
    result = insert_utenteantecedente(numutent, codantecedente)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def remover_antecedente(numutent: int, codantecedente: int):
    result = delete_utenteantecedente(numutent, codantecedente)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]