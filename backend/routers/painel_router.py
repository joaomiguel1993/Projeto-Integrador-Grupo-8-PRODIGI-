from fastapi import APIRouter
from backend.services import painel_service

router = APIRouter(prefix="/painel", tags=["Painel"])


@router.get("/tempos-espera/{id_hosp}")
def obter_tempos_espera(id_hosp: int):
    return painel_service.obter_tempos_espera(id_hosp)