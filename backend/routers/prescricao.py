from fastapi import APIRouter, HTTPException
from backend.schemas.prescricao import PrescricaoResponse
from backend.services.prescricoes_service import get_prescricoes_service, get_prescricao_service

router = APIRouter(prefix="/prescricoes", tags=["Prescrições"])

@router.get("/", response_model=list[PrescricaoResponse])
def get_prescricoes():
    return get_prescricoes_service()

@router.get("/{id_prescricao}", response_model=PrescricaoResponse)
def get_prescricao(id_prescricao: int):
    resultado = get_prescricao_service(id_prescricao)
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada")
    return resultado