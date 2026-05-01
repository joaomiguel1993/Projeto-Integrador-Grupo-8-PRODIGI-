from fastapi import APIRouter, HTTPException, Request
from backend.schemas.medicamento import MedicamentoResponse
from backend.services.medicamentos_service import get_medicamentos_service, get_medicamento_service
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

@router.get("/", response_model=list[MedicamentoResponse])
def get_medicamentos(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicamentos_service()
    insert_log(
        username=username,
        acao="LISTAR_MEDICAMENTOS",
        detalhe="Listagem de medicamentos consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{cod_medicamento}", response_model=MedicamentoResponse)
def get_medicamento(cod_medicamento: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicamento_service(cod_medicamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_MEDICAMENTO",
        detalhe=f"Medicamento {cod_medicamento} consultado.",
        ip=request.client.host
    )
    return resultado