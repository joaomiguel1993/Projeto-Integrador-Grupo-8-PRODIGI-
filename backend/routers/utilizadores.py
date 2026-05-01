from fastapi import APIRouter, HTTPException, Request
from backend.schemas.utilizador import UtilizadorDetalheResponse
from backend.services.utilizadores_service import (
    get_utilizadores_service,
    get_utilizador_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])

@router.get("/", response_model=list[UtilizadorDetalheResponse])
def get_utilizadores(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utilizadores_service()
    insert_log(
        username=username,
        acao="LISTAR_UTILIZADORES",
        detalhe="Listagem de utilizadores consultada.",
        ip=request.client.host
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
        ip=request.client.host
    )
    return resultado