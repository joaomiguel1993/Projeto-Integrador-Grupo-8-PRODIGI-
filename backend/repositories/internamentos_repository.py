from typing import Any, cast

from backend.dao.internamentos_dao import (
    select_all_internamentos,
    select_internamento_by_id,
    insert_internamento,
    update_internamento
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


def criar_internamento(codepurgenc: int, idfunc: int | None, datahoraint, motivoint: str,
                       numerocama: str | None = None, servico: str | None = None):
    return insert_internamento(codepurgenc, idfunc, datahoraint, motivoint, numerocama, servico)


def atualizar_internamento(cod_internamento: int, codepurgenc: int, idfunc: int | None, datahoraconsulta,
                           datahoraalta, motivoint: str, numerocama: str | None,
                           servico: str | None, tipoalta: str | None):
    return update_internamento(
        cod_internamento, codepurgenc, idfunc, datahoraconsulta,
        datahoraalta, motivoint, numerocama, servico, tipoalta
    )