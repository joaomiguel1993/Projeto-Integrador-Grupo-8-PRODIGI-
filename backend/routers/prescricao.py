from fastapi import APIRouter, HTTPException
from backend.repositories.prescricoes_repository import (
    listar_prescricoes,
    obter_prescricao,
    listar_alertas_prescricao
)

router = APIRouter(
    prefix="/prescricoes",
    tags=["Prescrições"],
    responses={404: {"description": "Prescrição não encontrada"}}
)

@router.get("/")
def get_prescricoes():
    return listar_prescricoes()

@router.get("/{id_prescricao}")
def get_prescricao(id_prescricao: int):
    resultado = obter_prescricao(id_prescricao)
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada")
    return resultado

@router.get("/{id_prescricao}/alertas")
def get_alertas_prescricao(id_prescricao: int):
    return listar_alertas_prescricao(id_prescricao)