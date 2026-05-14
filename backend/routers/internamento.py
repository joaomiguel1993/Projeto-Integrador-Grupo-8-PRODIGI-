from fastapi import APIRouter
from typing import List

from backend.schemas.internamento import (
    InternamentoCreate,
    InternamentoUpdate,
    InternamentoOut,
)
from backend.services import internamentos_service

router = APIRouter(prefix="/v1/internamentos", tags=["Internamentos"])


@router.get("/", response_model=List[InternamentoOut])
def listar_internamentos():
    return internamentos_service.listar_internamentos()


@router.get("/episodio/{cod_ep_urgenc}", response_model=InternamentoOut)
def obter_internamento_por_episodio(cod_ep_urgenc: int):
    return internamentos_service.obter_internamento_por_episodio(cod_ep_urgenc)


@router.get("/{cod_internamento}", response_model=InternamentoOut)
def obter_internamento(cod_internamento: int):
    return internamentos_service.obter_internamento(cod_internamento)


@router.post("/", response_model=InternamentoOut, status_code=201)
def criar_internamento(data: InternamentoCreate):
    return internamentos_service.criar_internamento(data.model_dump())


@router.put("/{cod_internamento}", response_model=InternamentoOut)
def atualizar_internamento(cod_internamento: int, data: InternamentoUpdate):
    return internamentos_service.atualizar_internamento(
        cod_internamento,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_internamento}")
def remover_internamento(cod_internamento: int):
    return internamentos_service.remover_internamento(cod_internamento)