from typing import Any, cast
from backend.dao.utilizadores_dao import (
    select_all_utilizadores,
    select_utilizador_by_idfunc,
    insert_utilizador,
    update_utilizador_by_idfunc,
    select_hospitais_by_idfunc,
    replace_hospitais_utilizador
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
    utilizador = result_list[0]

    hospitais = select_hospitais_by_idfunc(idfunc) or []
    utilizador["hospitais"] = hospitais

    return utilizador


def criar_utilizador(idfunc: int, username: str, password: str, hospitais: list[int] | None = None):
    created = insert_utilizador(idfunc, username, password)
    if not created:
        return None

    if hospitais is not None:
        replace_hospitais_utilizador(idfunc, hospitais)

    return obter_utilizador(idfunc)


# FIX: adicionado parâmetro bloqueado
def atualizar_utilizador(
    idfunc: int,
    username: str,
    password: str | None = None,
    hospitais: list[int] | None = None,
    bloqueado: bool | None = None,
):
    updated = update_utilizador_by_idfunc(idfunc, username, password, bloqueado)
    if not updated:
        return None

    if hospitais is not None:
        replace_hospitais_utilizador(idfunc, hospitais)

    return obter_utilizador(idfunc)