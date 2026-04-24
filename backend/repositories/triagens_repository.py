from typing import Any, cast

from backend.dao.triagens_dao import (
    select_all_triagens,
    select_triagem_by_id
)

def listar_triagens():
    result = select_all_triagens()
    if not result:
        return []
    return result

def obter_triagem(cod_ep_urgenc: int):
    result = select_triagem_by_id(cod_ep_urgenc)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]