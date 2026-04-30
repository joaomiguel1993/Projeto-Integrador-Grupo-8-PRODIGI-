from fastapi import APIRouter, HTTPException
from backend.schemas.hospital import HospitalCreate, HospitalResponse, HospitalDeleteResponse
from backend.services.hospitais_service import (
    get_hospitais_service,
    get_hospital_service,
    criar_hospital_service,
    remover_hospital_service
)

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

@router.post("/", status_code=201)
def criar_hospital(data: HospitalCreate):
    resultado = criar_hospital_service(data.nome, data.localizacao)
    if isinstance(resultado, dict) and "erro" in resultado:
        raise HTTPException(status_code=500, detail="Erro ao criar hospital")
    return {"message": "Hospital criado com sucesso"}

@router.delete("/{id_hosp}", response_model=HospitalDeleteResponse)
def deletar_hospital(id_hosp: int):
    hospital = get_hospital_service(id_hosp)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    remover_hospital_service(id_hosp)
    return {"message": "Hospital removido com sucesso", "idhosp": id_hosp}