from typing import Any, cast

from backend.dao.prescricoes_dao import (
    select_all_prescricoes,
    select_prescricao_by_id
)

def listar_prescricoes():
    result = select_all_prescricoes()
    if not result:
        return []
    return result

def obter_prescricao(id_prescricao: int):
    result = select_prescricao_by_id(id_prescricao)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]