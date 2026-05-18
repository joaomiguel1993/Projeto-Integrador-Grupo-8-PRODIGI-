from typing import List
from fastapi import APIRouter
from backend.schemas.internamento import (
    InternamentoCreate,
    InternamentoUpdate,
    InternamentoOut,
)
from backend.services import internamento_service

router = APIRouter(prefix="/api/v1/internamento", tags=["Internamento"])


@router.get("/", response_model=List[InternamentoOut])
def listar():
    return internamento_service.listar_internamentos()


@router.get("/episodio/{cod_ep_urgenc}", response_model=InternamentoOut)
def obter_ep(cod_ep_urgenc: int):
    return internamento_service.obter_por_ep(cod_ep_urgenc)


@router.get("/funcionario/{id_func}", response_model=List[InternamentoOut])
def listar_funcionario(id_func: int):
    return internamento_service.listar_por_funcionario(id_func)


@router.get("/estado/{estado_atual}", response_model=List[InternamentoOut])
def listar_estado(estado_atual: str):
    return internamento_service.listar_por_estado(estado_atual)


@router.get("/{cod_internamento}", response_model=InternamentoOut)
def obter(cod_internamento: int):
    return internamento_service.obter_internamento(cod_internamento)


@router.post("/", response_model=InternamentoOut, status_code=201)
def criar(data: InternamentoCreate):
    return internamento_service.criar_internamento(data.model_dump())


@router.put("/{cod_internamento}", response_model=InternamentoOut)
def atualizar(cod_internamento: int, data: InternamentoUpdate):
    return internamento_service.atualizar_internamento(
        cod_internamento,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_internamento}")
def remover(cod_internamento: int):
    return internamento_service.remover_internamento(cod_internamento)