from fastapi import APIRouter
from typing import List

from backend.schemas.utilizador import (
    UtilizadorCreate,
    UtilizadorUpdate,
    UtilizadorOut,
)
from backend.services import utilizadores_service

router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])


@router.get("/", response_model=List[UtilizadorOut])
def listar_utilizadores():
    return utilizadores_service.listar_utilizadores()


@router.get("/username/{username}", response_model=UtilizadorOut)
def obter_utilizador_por_username(username: str):
    return utilizadores_service.obter_utilizador_por_username(username)


@router.get("/{id_func}", response_model=UtilizadorOut)
def obter_utilizador(id_func: int):
    return utilizadores_service.obter_utilizador(id_func)


@router.post("/", response_model=UtilizadorOut, status_code=201)
def criar_utilizador(data: UtilizadorCreate):
    return utilizadores_service.criar_utilizador(data.model_dump())


@router.put("/{id_func}", response_model=UtilizadorOut)
def atualizar_utilizador(id_func: int, data: UtilizadorUpdate):
    return utilizadores_service.atualizar_utilizador(
        id_func,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_func}")
def remover_utilizador(id_func: int):
    return utilizadores_service.remover_utilizador(id_func)