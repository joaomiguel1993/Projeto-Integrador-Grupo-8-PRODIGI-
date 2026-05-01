from fastapi import APIRouter, HTTPException, Request
from backend.schemas.prescricao import PrescricaoResponse
from backend.services.prescricoes_service import get_prescricoes_service, get_prescricao_service
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/prescricoes", tags=["Prescrições"])

@router.get("/", response_model=list[PrescricaoResponse])
def get_prescricoes(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_prescricoes_service()
    insert_log(
        username=username,
        acao="LISTAR_PRESCRICOES",
        detalhe="Listagem de prescrições consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{id_prescricao}", response_model=PrescricaoResponse)
def get_prescricao(id_prescricao: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_prescricao_service(id_prescricao)
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada")
    insert_log(
        username=username,
        acao="CONSULTAR_PRESCRICAO",
        detalhe=f"Prescrição {id_prescricao} consultada.",
        ip=request.client.host
    )
    return resultado