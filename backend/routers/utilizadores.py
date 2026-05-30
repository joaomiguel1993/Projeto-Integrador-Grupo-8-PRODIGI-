from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.utilizador import (
    UtilizadorCreate,
    UtilizadorUpdate,
    UtilizadorOut,
)
from backend.services import utilizadores_service
from backend.auth.jwt_utils import get_current_user
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/v1/utilizadores", tags=["Utilizadores"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


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
def criar_utilizador(
    data: UtilizadorCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = utilizadores_service.criar_utilizador(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_UTILIZADOR",
        detalhe=f"Utilizador {data.model_dump().get('username')} criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_func}", response_model=UtilizadorOut)
def atualizar_utilizador(
    id_func: int,
    data: UtilizadorUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = utilizadores_service.atualizar_utilizador(
        id_func,
        data.model_dump(exclude_unset=True),
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="EDITAR_UTILIZADOR",
        detalhe=f"Utilizador ID {id_func} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_func}")
def remover_utilizador(
    id_func: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = utilizadores_service.remover_utilizador(id_func)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_UTILIZADOR",
        detalhe=f"Utilizador ID {id_func} removido.",
        ip=get_client_ip(request),
    )

    return result