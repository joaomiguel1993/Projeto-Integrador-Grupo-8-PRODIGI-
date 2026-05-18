from typing import List
from fastapi import APIRouter
from backend.schemas.estatisticas_ia import EstatisticasIAOut
from backend.services import estatisticas_ia_service

router = APIRouter(prefix="/api/v1/estatisticas-ia", tags=["Estatísticas IA"])


@router.get("/", response_model=List[EstatisticasIAOut])
def listar():
    return estatisticas_ia_service.listar_estatisticas()


@router.get("/{id_hosp}", response_model=EstatisticasIAOut)
def obter(id_hosp: int):
    return estatisticas_ia_service.obter_estatisticas_hospital(id_hosp)