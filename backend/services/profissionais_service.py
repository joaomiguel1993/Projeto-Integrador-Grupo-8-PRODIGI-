from fastapi import HTTPException
from backend.repositories.profissionais_repository import (
    listar_profissionais,
    obter_profissional,
    criar_profissional
)


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

    return criar_profissional(nome, tipofunc, sexo)