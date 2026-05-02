from fastapi import HTTPException
from backend.repositories.profissionais_repository import (
    listar_profissionais,
    obter_profissional,
    criar_profissional,
    atualizar_profissional
)
from backend.dao.logs_dao import insert_log


def get_profissionais_service():
    return listar_profissionais()


def get_profissional_service(id_func: int):
    return obter_profissional(id_func)


def create_profissional_service(nome: str, tipofunc: str, sexo: str):
    allowed_types = {"medico", "enfermeiro", "admin", "rececionista"}
    allowed_sexos = {"M", "F"}

    if tipofunc not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de profissional inválido.")

    if sexo not in allowed_sexos:
        raise HTTPException(status_code=400, detail="Sexo inválido. Use 'M' ou 'F'.")

    novo = criar_profissional(nome, tipofunc, sexo)

    if not novo:
        raise HTTPException(status_code=500, detail="Erro ao criar profissional.")

    insert_log(
        "sistema",
        "CRIAR_PROFISSIONAL",
        f"id={novo['idfunc']}, nome={novo['nome']}, tipofunc={novo['tipofunc']}, sexo={novo['sexo']}",
        None
    )

    return novo


def update_profissional_service(id_func: int, nome: str, tipofunc: str, sexo: str):
    allowed_types = {"medico", "enfermeiro", "admin", "rececionista"}
    allowed_sexos = {"M", "F"}

    if tipofunc not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de profissional inválido.")

    if sexo not in allowed_sexos:
        raise HTTPException(status_code=400, detail="Sexo inválido. Use 'M' ou 'F'.")

    profissional_existente = obter_profissional(id_func)
    if not profissional_existente:
        raise HTTPException(status_code=404, detail="Profissional não encontrado.")

    atualizado = atualizar_profissional(id_func, nome, tipofunc, sexo)
    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar profissional.")

    insert_log(
        "sistema",
        "ATUALIZAR_PROFISSIONAL",
        f"id={id_func}, nome={nome}, tipofunc={tipofunc}, sexo={sexo}",
        None
    )

    return atualizado