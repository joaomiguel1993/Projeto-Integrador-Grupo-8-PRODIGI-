from fastapi import APIRouter, HTTPException
from backend.repositories.atos_repository import (
    listar_atos,
    obter_ato,
    listar_funcionarios_ato,
    listar_prescricoes_ato
)

router = APIRouter(
    prefix="/atos",
    tags=["Atos"],
    responses={404: {"description": "Ato não encontrado"}}
)

@router.get("/")
def get_atos():
    return listar_atos()

@router.get("/{id_ato}")
def get_ato(id_ato: int):
    resultado = obter_ato(id_ato)
    if not resultado:
        raise HTTPException(status_code=404, detail="Ato não encontrado")
    return resultado

@router.get("/{id_ato}/funcionarios")
def get_funcionarios_ato(id_ato: int):
    return listar_funcionarios_ato(id_ato)

@router.get("/{id_ato}/prescricoes")
def get_prescricoes_ato(id_ato: int):
    return listar_prescricoes_ato(id_ato)