from typing import List
from fastapi import APIRouter
from backend.schemas.historico_internamento import (
    HistoricoInternamentoCreate,
    HistoricoInternamentoUpdate,
    HistoricoInternamentoOut,
)
from backend.services import historico_internamento_service

router = APIRouter(
    prefix="/api/v1/historico-internamento",
    tags=["Histórico Internamento"]
)


@router.get("/", response_model=List[HistoricoInternamentoOut])
def listar():
    return historico_internamento_service.listar_historico()


@router.get("/internamento/{cod_internamento}", response_model=List[HistoricoInternamentoOut])
def listar_internamento(cod_internamento: int):
    return historico_internamento_service.listar_por_internamento(cod_internamento)


@router.get("/funcionario/{id_func}", response_model=List[HistoricoInternamentoOut])
def listar_funcionario(id_func: int):
    return historico_internamento_service.listar_por_funcionario(id_func)


@router.get("/tipo-evento/{tipo_evento}", response_model=List[HistoricoInternamentoOut])
def listar_tipo_evento(tipo_evento: str):
    return historico_internamento_service.listar_por_tipo_evento(tipo_evento)


@router.get("/{id_historico}", response_model=HistoricoInternamentoOut)
def obter(id_historico: int):
    return historico_internamento_service.obter_historico(id_historico)


@router.post("/", response_model=HistoricoInternamentoOut, status_code=201)
def criar(data: HistoricoInternamentoCreate):
    return historico_internamento_service.criar_historico(data.model_dump())


@router.put("/{id_historico}", response_model=HistoricoInternamentoOut)
def atualizar(id_historico: int, data: HistoricoInternamentoUpdate):
    return historico_internamento_service.atualizar_historico(
        id_historico,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_historico}")
def remover(id_historico: int):
    return historico_internamento_service.remover_historico(id_historico)