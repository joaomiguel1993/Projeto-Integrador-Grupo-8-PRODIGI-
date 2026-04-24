from fastapi import APIRouter, HTTPException
from backend.schemas.hospital import HospitalResponse
from backend.services.hospitais_service import get_hospitais_service, get_hospital_service

router = APIRouter(prefix="/hospitais", tags=["Hospitais"])

@router.get("/", response_model=list[HospitalResponse])
def get_hospitais():
    return get_hospitais_service()

@router.get("/{id_hosp}", response_model=HospitalResponse)
def get_hospital(id_hosp: int):
    resultado = get_hospital_service(id_hosp)
    if not resultado:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    return resultado