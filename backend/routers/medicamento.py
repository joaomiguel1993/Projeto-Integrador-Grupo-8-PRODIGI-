from fastapi import APIRouter
from typing import List

from backend.schemas.medicamento import (
    MedicamentoCreate,
    MedicamentoUpdate,
    MedicamentoOut,
)
from backend.services import medicamentos_service

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])


@router.get("/", response_model=List[MedicamentoOut])
def listar_medicamentos():
    return medicamentos_service.listar_medicamentos()


@router.get("/{cod_medicamento}", response_model=MedicamentoOut)
def obter_medicamento(cod_medicamento: int):
    return medicamentos_service.obter_medicamento(cod_medicamento)


@router.post("/", response_model=MedicamentoOut, status_code=201)
def criar_medicamento(data: MedicamentoCreate):
    return medicamentos_service.criar_medicamento(data.model_dump())


@router.put("/{cod_medicamento}", response_model=MedicamentoOut)
def atualizar_medicamento(cod_medicamento: int, data: MedicamentoUpdate):
    return medicamentos_service.atualizar_medicamento(
        cod_medicamento,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_medicamento}")
def remover_medicamento(cod_medicamento: int):
    return medicamentos_service.remover_medicamento(cod_medicamento)