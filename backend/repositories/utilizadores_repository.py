from typing import Any, cast
from backend.dao.utilizadores_dao import (
    select_all_utilizadores,
    select_utilizador_by_idfunc
)
 
def listar_utilizadores():
    result = select_all_utilizadores()
    if not result:
        return []
    return result
 
def obter_utilizador(idfunc: int):
    result = select_utilizador_by_idfunc(idfunc)
    if not result:
        return None
 
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]
 