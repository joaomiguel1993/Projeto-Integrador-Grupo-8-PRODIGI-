from typing import Any, cast
from backend.dao.triagens_dao import (
    select_all_triagens,
    select_triagem_by_id,
    insert_triagem,
    update_triagem
)


def listar_triagens():
    result = select_all_triagens()
    return result if result else []


def obter_triagem(cod_ep_urgenc: int):
    result = select_triagem_by_id(cod_ep_urgenc)
    if not result:
        return None
    return cast(list[dict[str, Any]], result)[0]


def criar_triagem(data):
    return insert_triagem(
        data.codepurgenc, data.datahorainicio, data.cortriagem, data.sintomas,
        data.temperatura, data.freqcard, data.freqresp, data.spo2, data.sistolica, data.diastolica
    )


def atualizar_triagem(cod_ep_urgenc: int, data):
    return update_triagem(
        cod_ep_urgenc, data.cortriagem, data.sintomas,
        data.temperatura, data.freqcard, data.freqresp, data.spo2, data.sistolica, data.diastolica,
        data.datahorafim
    )