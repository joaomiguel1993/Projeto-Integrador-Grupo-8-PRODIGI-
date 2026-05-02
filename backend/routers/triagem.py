from fastapi import APIRouter, HTTPException, Request
from backend.schemas.triagem import TriagemResponse
from backend.services.triagens_service import get_triagens_service, get_triagem_service
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/triagens", tags=["Triagens"])

@router.get("/", response_model=list[TriagemResponse])
def get_triagens(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_triagens_service()
    insert_log(
        username=username,
        acao="LISTAR_TRIAGENS",
        detalhe="Listagem de triagens consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{cod_ep_urgenc}", response_model=TriagemResponse)
def get_triagem(cod_ep_urgenc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_triagem_service(cod_ep_urgenc)
    if not resultado:
        raise HTTPException(status_code=404, detail="Triagem não encontrada")
    insert_log(
        username=username,
        acao="CONSULTAR_TRIAGEM",
        detalhe=f"Triagem do episódio {cod_ep_urgenc} consultada.",
        ip=request.client.host
    )
    return resultado