from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.services.hospitais_service import (
    get_hospitais_service,
    get_hospital_service,
    create_hospital_service,
    update_hospital_service,
    delete_hospital_service
)

router = APIRouter(prefix="/api/hospitais", tags=["Hospitais"])


class HospitalCreate(BaseModel):
    nome: str
    localizacao: str
    email: Optional[str] = None
    telefone: Optional[str] = None


class HospitalUpdate(BaseModel):
    nome: str
    localizacao: str
    email: Optional[str] = None
    telefone: Optional[str] = None


@router.get("/")
def get_hospitais():
    return get_hospitais_service()


@router.get("/{id_hosp}")
def get_hospital(id_hosp: int):
    return get_hospital_service(id_hosp)


@router.post("/")
def criar_hospital(payload: HospitalCreate):
    return create_hospital_service(
        payload.nome,
        payload.localizacao,
        payload.email,
        payload.telefone
    )


@router.put("/{id_hosp}")
def atualizar_hospital(id_hosp: int, payload: HospitalUpdate):
    return update_hospital_service(
        id_hosp,
        payload.nome,
        payload.localizacao,
        payload.email,
        payload.telefone
    )


@router.delete("/{id_hosp}")
def deletar_hospital(id_hosp: int):
    return delete_hospital_service(id_hosp)