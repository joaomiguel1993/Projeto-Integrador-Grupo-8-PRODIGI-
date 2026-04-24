from typing import Any, cast

from backend.dao.atos_dao import (
    select_all_atos,
    select_ato_by_id,
    select_atos_by_ep_urgencia,
    insert_ato,
    select_funcionarios_by_ato,
    select_prescricoes_by_ato
)


def listar_atos():
    result = select_all_atos()
    if not result:
        return []
    return result


def obter_ato(id_ato: int):
    result = select_ato_by_id(id_ato)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def listar_atos_por_episodio(cod_ep_urgenc: int):
    result = select_atos_by_ep_urgencia(cod_ep_urgenc)
    if not result:
        return []
    return result


def criar_ato(cod_ep_urgenc: int, tipo: str, descricao: str | None, data_hora_inicio):
    result = insert_ato(cod_ep_urgenc, tipo, descricao, data_hora_inicio)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def listar_funcionarios_do_ato(id_ato: int):
    result = select_funcionarios_by_ato(id_ato)
    if not result:
        return []
    return result


def listar_prescricoes_do_ato(id_ato: int):
    result = select_prescricoes_by_ato(id_ato)
    if not result:
        return []
    return result