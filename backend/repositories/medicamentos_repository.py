from typing import Any, cast

from backend.dao.medicamentos_dao import (
    select_all_medicamentos,
    select_medicamento_by_id,
    insert_medicamento,
    update_medicamento
)


def listar_medicamentos():
    result = select_all_medicamentos()
    if not result or not isinstance(result, list):
        return []
    return result


def obter_medicamento(cod_medicamento: int):
    result = select_medicamento_by_id(cod_medicamento)
    if not result or not isinstance(result, list):
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def criar_medicamento(nome: str, principioativo: str):
    return insert_medicamento(nome, principioativo)


def atualizar_medicamento(cod_medicamento: int, nome: str, principioativo: str):
    return update_medicamento(cod_medicamento, nome, principioativo)