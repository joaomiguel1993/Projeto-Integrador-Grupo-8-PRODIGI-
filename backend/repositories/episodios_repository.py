from typing import Any, cast

from backend.dao.episodios_dao import (
    select_all_episodios,
    select_episodio_by_id,
    insert_episodio,
    update_episodio
)


def listar_episodios():
    result = select_all_episodios()
    if not result:
        return []
    return result


def obter_episodio(cod_ep_urgenc: int):
    result = select_episodio_by_id(cod_ep_urgenc)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def criar_episodio(num_utente: int, id_hosp: int):
    result = insert_episodio(num_utente, id_hosp)
    if not result:
        return None

    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]


def atualizar_episodio(cod_ep_urgenc: int, num_utente: int, id_hosp: int, datahora_saida, estado: str):
    return update_episodio(cod_ep_urgenc, num_utente, id_hosp, datahora_saida, estado)