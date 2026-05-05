from fastapi import HTTPException
from backend.repositories.utilizadores_repository import (
    listar_utilizadores,
    obter_utilizador,
    criar_utilizador,
    atualizar_utilizador
)


def get_utilizadores_service():
    return listar_utilizadores()


def get_utilizador_service(idfunc: int):
    return obter_utilizador(idfunc)


def create_utilizador_service(
    idfunc: int,
    username: str,
    password: str,
    hospitais: list[int] | None = None
):
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username é obrigatório.")

    if not password or not password.strip():
        raise HTTPException(status_code=400, detail="Password é obrigatória.")

    existente = obter_utilizador(idfunc)
    if existente:
        raise HTTPException(status_code=400, detail="Já existe um utilizador para esse funcionário.")

    criado = criar_utilizador(
        idfunc=idfunc,
        username=username.strip(),
        password=password,
        hospitais=hospitais or []
    )

    if not criado:
        raise HTTPException(status_code=500, detail="Erro ao criar utilizador.")

    return criado


def update_utilizador_service(
    idfunc: int,
    username: str,
    password: str | None = None,
    hospitais: list[int] | None = None,
    bloqueado: bool | None = None,
):
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username é obrigatório.")

    existente = obter_utilizador(idfunc)
    if not existente:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")

    # FIX: passa bloqueado ao repository — precisas de atualizar essa função também
    atualizado = atualizar_utilizador(
        idfunc=idfunc,
        username=username.strip(),
        password=password,
        hospitais=hospitais or [],
        bloqueado=bloqueado,
    )

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar utilizador.")

    return atualizado