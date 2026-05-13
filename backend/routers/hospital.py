from fastapi import APIRouter
from typing import List

from backend.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalOut
from backend.services import hospitais_service

router = APIRouter(prefix="/hospitais", tags=["Hospitais"])


@router.get("/", response_model=List[HospitalOut])
def listar_hospitais():
    return hospitais_service.listar_hospitais()


@router.get("/{id_hosp}", response_model=HospitalOut)
def obter_hospital(id_hosp: int):
    return hospitais_service.obter_hospital(id_hosp)


@router.post("/", response_model=HospitalOut, status_code=201)
def criar_hospital(data: HospitalCreate):
    return hospitais_service.criar_hospital(data.model_dump())


@router.put("/{id_hosp}", response_model=HospitalOut)
def atualizar_hospital(id_hosp: int, data: HospitalUpdate):
    return hospitais_service.atualizar_hospital(
        id_hosp,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_hosp}")
def remover_hospital(id_hosp: int):
    return hospitais_service.remover_hospital(id_hosp)