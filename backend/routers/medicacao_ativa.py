from typing import List
from fastapi import APIRouter
from backend.schemas.medicacao_ativa import (
    MedicacaoAtivaCreate,
    MedicacaoAtivaUpdate,
    MedicacaoAtivaOut,
)
from backend.services import medicacao_ativa_service

router = APIRouter(prefix="/api/v1/medicacao-ativa", tags=["Medicação Ativa"])


@router.get("/", response_model=List[MedicacaoAtivaOut])
def listar():
    return medicacao_ativa_service.listar_medicacao_ativa()


@router.get("/utente/{nif}", response_model=List[MedicacaoAtivaOut])
def listar_nif(nif: str):
    return medicacao_ativa_service.listar_por_nif(nif)


@router.get("/medicamento/{cod_medicamento}", response_model=List[MedicacaoAtivaOut])
def listar_medicamento(cod_medicamento: int):
    return medicacao_ativa_service.listar_por_medicamento(cod_medicamento)


@router.get("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def obter(cod_medicacao_ativa: int):
    return medicacao_ativa_service.obter_medicacao_ativa(cod_medicacao_ativa)


@router.post("/", response_model=MedicacaoAtivaOut, status_code=201)
def criar(data: MedicacaoAtivaCreate):
    return medicacao_ativa_service.criar_medicacao_ativa(data.model_dump())


@router.put("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def atualizar(cod_medicacao_ativa: int, data: MedicacaoAtivaUpdate):
    return medicacao_ativa_service.atualizar_medicacao_ativa(
        cod_medicacao_ativa,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_medicacao_ativa}")
def remover(cod_medicacao_ativa: int):
    return medicacao_ativa_service.remover_medicacao_ativa(cod_medicacao_ativa)