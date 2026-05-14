from fastapi import APIRouter
from typing import List

from backend.schemas.medicacaoativa import (
    MedicacaoAtivaCreate,
    MedicacaoAtivaUpdate,
    MedicacaoAtivaOut,
)
from backend.services import medicacaoativa_service

router = APIRouter(prefix="/v1/medicacao-ativa", tags=["Medicação Ativa"])


@router.get("/", response_model=List[MedicacaoAtivaOut])
def listar_medicacoes_ativas():
    return medicacaoativa_service.listar_medicacoes_ativas()


@router.get("/utente/{num_utent}", response_model=List[MedicacaoAtivaOut])
def listar_medicacoes_ativas_por_utente(num_utent: int):
    return medicacaoativa_service.listar_medicacoes_ativas_por_utente(num_utent)


@router.get("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def obter_medicacao_ativa(cod_medicacao_ativa: int):
    return medicacaoativa_service.obter_medicacao_ativa(cod_medicacao_ativa)


@router.post("/", response_model=MedicacaoAtivaOut, status_code=201)
def criar_medicacao_ativa(data: MedicacaoAtivaCreate):
    return medicacaoativa_service.criar_medicacao_ativa(data.model_dump())


@router.put("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def atualizar_medicacao_ativa(cod_medicacao_ativa: int, data: MedicacaoAtivaUpdate):
    return medicacaoativa_service.atualizar_medicacao_ativa(
        cod_medicacao_ativa,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_medicacao_ativa}")
def remover_medicacao_ativa(cod_medicacao_ativa: int):
    return medicacaoativa_service.remover_medicacao_ativa(cod_medicacao_ativa)