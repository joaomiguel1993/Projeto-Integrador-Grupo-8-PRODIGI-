from fastapi import APIRouter, HTTPException
from backend.repositories.hospitais_repository import (
    listar_hospitais,
    obter_hospital,
    listar_episodios_hospital
)

router = APIRouter(
    prefix="/hospitais",
    tags=["Hospitais"],
    responses={404: {"description": "Hospital não encontrado"}}
)

@router.get("/")
def get_hospitais():
    return listar_hospitais()

@router.get("/{id_hosp}")
def get_hospital(id_hosp: int):
    resultado = obter_hospital(id_hosp)
    if not resultado:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    return resultado

@router.get("/{id_hosp}/episodios")
def get_episodios_hospital(id_hosp: int):
    return listar_episodios_hospital(id_hosp)