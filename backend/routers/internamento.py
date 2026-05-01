from fastapi import APIRouter, HTTPException, Request
from backend.schemas.internamento import InternamentoResponse
from backend.services.internamentos_service import get_internamentos_service, get_internamento_service
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/internamentos", tags=["Internamentos"])

@router.get("/", response_model=list[InternamentoResponse])
def get_internamentos(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_internamentos_service()
    insert_log(
        username=username,
        acao="LISTAR_INTERNAMENTOS",
        detalhe="Listagem de internamentos consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{cod_internamento}", response_model=InternamentoResponse)
def get_internamento(cod_internamento: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_internamento_service(cod_internamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_INTERNAMENTO",
        detalhe=f"Internamento {cod_internamento} consultado.",
        ip=request.client.host
    )
    return resultado