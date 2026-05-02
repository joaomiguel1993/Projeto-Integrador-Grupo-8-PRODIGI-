from typing import Any, cast

from backend.dao.prescricoes_dao import (
    select_all_prescricoes,
    select_prescricao_by_id,
    insert_prescricao,
    update_prescricao
)


def listar_prescricoes():
    result = select_all_prescricoes()
    if not result or not isinstance(result, list):
        return []
    return result


def obter_prescricao(id_prescricao: int):
    result = select_prescricao_by_id(id_prescricao)
    if not result or not isinstance(result, list):
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def criar_prescricao(id_ato: int, descricao: str):
    return insert_prescricao(id_ato, descricao)


def atualizar_prescricao(id_prescricao: int, id_ato: int, descricao: str):
    return update_prescricao(id_prescricao, id_ato, descricao)