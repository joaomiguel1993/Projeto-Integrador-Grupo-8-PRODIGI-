from typing import Any, cast

from backend.dao.medicamentos_dao import (
    select_all_medicamentos,
    select_medicamento_by_id
)

def listar_medicamentos():
    result = select_all_medicamentos()
    if not result:
        return []
    return result

def obter_medicamento(cod_medicamento: int):
    result = select_medicamento_by_id(cod_medicamento)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]