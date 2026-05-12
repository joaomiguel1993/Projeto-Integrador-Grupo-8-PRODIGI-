import psycopg2
from fastapi import HTTPException

from backend.repositories.utentes_repository import (
    listar_utentes,
    obter_utente,
    criar_utente,
    atualizar_utente
)


def get_utentes_service():
    return listar_utentes()


def get_utente_service(num_utente: int):
    return obter_utente(num_utente)


def create_utente_service(
    nome: str,
    nif: str,
    datanasc,
    sexo: str,
    localidade: str | None = None,
    telefone: str | None = None,
    email: str | None = None
):
    if not nome or not nome.strip():
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")

    if not nif or len(nif.strip()) != 9:
        raise HTTPException(status_code=400, detail="NIF inválido.")

    if sexo not in {"M", "F"}:
        raise HTTPException(status_code=400, detail="Sexo inválido. Use 'M' ou 'F'.")

    try:
        criado = criar_utente(
            nome=nome.strip(),
            nif=nif.strip(),
            datanasc=datanasc,
            sexo=sexo,
            localidade=localidade.strip() if localidade else None,
            telefone=telefone.strip() if telefone else None,
            email=email.strip() if email else None
        )
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Já existe um utente com este NIF.")

    if not criado:
        raise HTTPException(status_code=500, detail="Erro ao criar utente.")

    return criado


def update_utente_service(
    num_utente: int,
    nome: str,
    nif: str,
    datanasc,
    sexo: str,
    localidade: str | None = None,
    telefone: str | None = None,
    email: str | None = None
):
    existente = obter_utente(num_utente)
    if not existente:
        raise HTTPException(status_code=404, detail="Utente não encontrado.")

    if not nome or not nome.strip():
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")

    if not nif or len(nif.strip()) != 9:
        raise HTTPException(status_code=400, detail="NIF inválido.")

    if sexo not in {"M", "F"}:
        raise HTTPException(status_code=400, detail="Sexo inválido. Use 'M' ou 'F'.")

    try:
        atualizado = atualizar_utente(
            num_utente=num_utente,
            nome=nome.strip(),
            nif=nif.strip(),
            datanasc=datanasc,
            sexo=sexo,
            localidade=localidade.strip() if localidade else None,
            telefone=telefone.strip() if telefone else None,
            email=email.strip() if email else None
        )
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Já existe um utente com este NIF.")

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar utente.")

    return atualizado