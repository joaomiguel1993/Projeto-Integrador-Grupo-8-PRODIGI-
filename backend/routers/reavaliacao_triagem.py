from typing import List
from fastapi import APIRouter
from backend.schemas.reavaliacao_triagem import (
    ReavaliacaoTriagemCreate,
    ReavaliacaoTriagemUpdate,
    ReavaliacaoTriagemOut,
)
from backend.services import reavaliacao_triagem_service

router = APIRouter(prefix="/api/v1/reavaliacao-triagem", tags=["Reavaliação Triagem"])


@router.get("/", response_model=List[ReavaliacaoTriagemOut])
def listar():
    return reavaliacao_triagem_service.listar_reavaliacoes()


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[ReavaliacaoTriagemOut])
def listar_ep(cod_ep_urgenc: int):
    return reavaliacao_triagem_service.listar_por_ep(cod_ep_urgenc)


@router.get("/funcionario/{id_func}", response_model=List[ReavaliacaoTriagemOut])
def listar_funcionario(id_func: int):
    return reavaliacao_triagem_service.listar_por_funcionario(id_func)


@router.get("/{id_reavaliacao}", response_model=ReavaliacaoTriagemOut)
def obter(id_reavaliacao: int):
    return reavaliacao_triagem_service.obter_reavaliacao(id_reavaliacao)


@router.post("/", response_model=ReavaliacaoTriagemOut, status_code=201)
def criar(data: ReavaliacaoTriagemCreate):
    return reavaliacao_triagem_service.criar_reavaliacao(data.model_dump())


@router.put("/{id_reavaliacao}", response_model=ReavaliacaoTriagemOut)
def atualizar(id_reavaliacao: int, data: ReavaliacaoTriagemUpdate):
    return reavaliacao_triagem_service.atualizar_reavaliacao(
        id_reavaliacao,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_reavaliacao}")
def remover(id_reavaliacao: int):
    return reavaliacao_triagem_service.remover_reavaliacao(id_reavaliacao)