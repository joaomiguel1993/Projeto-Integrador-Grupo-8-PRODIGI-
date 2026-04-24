from typing import Any, cast

from backend.dao.internamentos_dao import (
    select_all_internamentos,
    select_internamento_by_id
)

def listar_internamentos():
    result = select_all_internamentos()
    if not result:
        return []
    return result

def obter_internamento(cod_internamento: int):
    result = select_internamento_by_id(cod_internamento)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]