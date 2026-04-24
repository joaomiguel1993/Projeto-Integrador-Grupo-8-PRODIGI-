from fastapi import APIRouter, HTTPException
from backend.schemas.medicamento import MedicamentoResponse
from backend.services.medicamentos_service import get_medicamentos_service, get_medicamento_service

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

@router.get("/", response_model=list[MedicamentoResponse])
def get_medicamentos():
    return get_medicamentos_service()

@router.get("/{cod_medicamento}", response_model=MedicamentoResponse)
def get_medicamento(cod_medicamento: int):
    resultado = get_medicamento_service(cod_medicamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    return resultado