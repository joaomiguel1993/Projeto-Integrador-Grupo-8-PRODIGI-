from typing import Any, cast

from backend.dao.profissionais_dao import (
    select_all_profissionais,
    select_profissional_by_id
)

def listar_profissionais():
    result = select_all_profissionais()
    if not result:
        return []
    return result

def obter_profissional(id_func: int):
    result = select_profissional_by_id(id_func)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]