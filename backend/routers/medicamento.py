from fastapi import APIRouter, HTTPException
from backend.repositories.medicamentos_repository import (
    listar_medicamentos,
    obter_medicamento,
    listar_utentes_com_medicamento
)

router = APIRouter(
    prefix="/medicamentos",
    tags=["Medicamentos"],
    responses={404: {"description": "Medicamento não encontrado"}}
)

@router.get("/")
def get_medicamentos():
    return listar_medicamentos()

@router.get("/{cod_medicamento}")
def get_medicamento(cod_medicamento: int):
    resultado = obter_medicamento(cod_medicamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    return resultado

@router.get("/{cod_medicamento}/utentes")
def get_utentes_com_medicamento(cod_medicamento: int):
    return listar_utentes_com_medicamento(cod_medicamento)