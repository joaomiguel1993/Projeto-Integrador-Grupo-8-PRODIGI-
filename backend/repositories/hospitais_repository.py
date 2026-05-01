from typing import Any, cast

from backend.dao.hospitais_dao import (
    select_all_hospitais,
    select_hospital_by_id,
    insert_hospital,
    delete_hospital
)

def listar_hospitais():
    result = select_all_hospitais()
    if not result:
        return []
    return result

def obter_hospital(id_hosp: int):
    result = select_hospital_by_id(id_hosp)
    if not result:
        return None
    result_list = cast(list[dict[str, Any]], result)
    return result_list[0]

def criar_hospital(nome: str, localizacao: str):
    return insert_hospital(nome, localizacao)

def remover_hospital(id_hosp: int):
    result = delete_hospital(id_hosp)
    if isinstance(result, dict) and "erro" in result:
        return None
    return result