from typing import Any, cast

from backend.dao.utentes_dao import (
    select_all_utentes,
    select_utente_by_id
)

def listar_utentes():
    result = select_all_utentes()
    if not result:
        return []
    return result

def obter_utente(num_utente: int):
    result = select_utente_by_id(num_utente)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]