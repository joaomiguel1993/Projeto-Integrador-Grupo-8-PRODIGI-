from fastapi import APIRouter
from backend.services import painel_service

router = APIRouter(prefix="/v1/predict", tags=["Predict"])


@router.get("/tempos-espera/{id_hosp}")
def obter_tempos_espera(id_hosp: int):
    return painel_service.obter_tempos_espera(id_hosp)