from fastapi import APIRouter
from typing import List

from backend.schemas.antecedente import (
    AntecedenteCreate,
    AntecedenteUpdate,
    AntecedenteOut,
)
from backend.services import antecedentes_service

router = APIRouter(prefix="/antecedentes", tags=["Antecedentes"])


@router.get("/", response_model=List[AntecedenteOut])
def listar_antecedentes():
    return antecedentes_service.listar_antecedentes()


@router.get("/{cod_antecedente}", response_model=AntecedenteOut)
def obter_antecedente(cod_antecedente: int):
    return antecedentes_service.obter_antecedente(cod_antecedente)


@router.post("/", response_model=AntecedenteOut, status_code=201)
def criar_antecedente(data: AntecedenteCreate):
    return antecedentes_service.criar_antecedente(data.model_dump())


@router.put("/{cod_antecedente}", response_model=AntecedenteOut)
def atualizar_antecedente(cod_antecedente: int, data: AntecedenteUpdate):
    return antecedentes_service.atualizar_antecedente(
        cod_antecedente,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_antecedente}")
def remover_antecedente(cod_antecedente: int):
    return antecedentes_service.remover_antecedente(cod_antecedente)