from typing import Any, cast

from backend.dao.hospitais_dao import (
    select_all_hospitais,
    select_hospital_by_id,
    insert_hospital,
    update_hospital_by_id,
    delete_hospital_by_id
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


def criar_hospital(nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    return insert_hospital(nome, localizacao, email, telefone)


def atualizar_hospital(id_hosp: int, nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    return update_hospital_by_id(id_hosp, nome, localizacao, email, telefone)


def deletar_hospital(id_hosp: int):
    return delete_hospital_by_id(id_hosp)