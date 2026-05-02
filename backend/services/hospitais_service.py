from fastapi import HTTPException
from backend.repositories.hospitais_repository import (
    listar_hospitais,
    obter_hospital,
    criar_hospital,
    atualizar_hospital,
    deletar_hospital
)
from backend.dao.logs_dao import insert_log


def get_hospitais_service():
    return listar_hospitais()


def get_hospital_service(id_hosp: int):
    hospital = obter_hospital(id_hosp)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")
    return hospital


def create_hospital_service(nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    if not nome.strip():
        raise HTTPException(status_code=400, detail="Nome do hospital é obrigatório.")

    if not localizacao.strip():
        raise HTTPException(status_code=400, detail="Localização do hospital é obrigatória.")

    novo = criar_hospital(nome, localizacao, email, telefone)

    insert_log(
        "sistema",
        "CRIAR_HOSPITAL",
        f"id={novo['idhosp']}, nome={novo['nome']}",
        None
    )

    return novo


def update_hospital_service(id_hosp: int, nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    if not nome.strip():
        raise HTTPException(status_code=400, detail="Nome do hospital é obrigatório.")

    if not localizacao.strip():
        raise HTTPException(status_code=400, detail="Localização do hospital é obrigatória.")

    existente = obter_hospital(id_hosp)
    if not existente:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")

    atualizado = atualizar_hospital(id_hosp, nome, localizacao, email, telefone)
    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar hospital.")

    insert_log(
        "sistema",
        "ATUALIZAR_HOSPITAL",
        f"id={id_hosp}, nome={nome}",
        None
    )

    return atualizado


def delete_hospital_service(id_hosp: int):
    existente = obter_hospital(id_hosp)
    if not existente:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")

    ok = deletar_hospital(id_hosp)
    if not ok:
        raise HTTPException(status_code=500, detail="Erro ao apagar hospital.")

    insert_log(
        "sistema",
        "APAGAR_HOSPITAL",
        f"id={id_hosp}, nome={existente['nome']}",
        None
    )

    return {"message": "Hospital apagado com sucesso."}