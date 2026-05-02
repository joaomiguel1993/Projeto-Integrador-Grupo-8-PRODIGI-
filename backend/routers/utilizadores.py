from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from backend.schemas.utilizador import (
    UtilizadorCreate,
    UtilizadorDetalheResponse
)
from backend.services.utilizadores_service import (
    get_utilizadores_service,
    get_utilizador_service,
    create_utilizador_service,
    update_utilizador_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])


class UtilizadorUpdateRequest(BaseModel):
    username: str
    password: Optional[str] = None
    hospitais: list[int] = []


def get_client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("/", response_model=list[UtilizadorDetalheResponse])
def get_utilizadores(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utilizadores_service()

    insert_log(
        username=username,
        acao="LISTAR_UTILIZADORES",
        detalhe="Listagem de utilizadores consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.get("/{idfunc}", response_model=UtilizadorDetalheResponse)
def get_utilizador(idfunc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utilizador_service(idfunc)

    if not resultado:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")

    insert_log(
        username=username,
        acao="CONSULTAR_UTILIZADOR",
        detalhe=f"Utilizador {idfunc} consultado.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/", response_model=UtilizadorDetalheResponse)
def criar_utilizador(payload: UtilizadorCreate, request: Request):
    username_request = request.headers.get("X-Username", "desconhecido")

    resultado = create_utilizador_service(
        idfunc=payload.idfunc,
        username=payload.username,
        password=payload.password,
        hospitais=[]
    )

    insert_log(
        username=username_request,
        acao="CRIAR_UTILIZADOR",
        detalhe=f"Utilizador criado para o funcionário {payload.idfunc}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.put("/{idfunc}", response_model=UtilizadorDetalheResponse)
def atualizar_utilizador(idfunc: int, payload: UtilizadorUpdateRequest, request: Request):
    username_request = request.headers.get("X-Username", "desconhecido")

    resultado = update_utilizador_service(
        idfunc=idfunc,
        username=payload.username,
        password=payload.password,
        hospitais=payload.hospitais
    )

    insert_log(
        username=username_request,
        acao="ATUALIZAR_UTILIZADOR",
        detalhe=f"Utilizador {idfunc} atualizado. Hospitais={payload.hospitais}",
        ip=get_client_ip(request)
    )

    return resultado