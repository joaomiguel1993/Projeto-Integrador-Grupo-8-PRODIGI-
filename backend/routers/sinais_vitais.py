from typing import List
from fastapi import APIRouter
from backend.schemas.sinais_vitais import (
    SinaisVitaisCreate,
    SinaisVitaisUpdate,
    SinaisVitaisOut,
)
from backend.services import sinais_vitais_service

router = APIRouter(prefix="/api/v1/sinais-vitais", tags=["Sinais Vitais"])


@router.get("/", response_model=List[SinaisVitaisOut])
def listar():
    return sinais_vitais_service.listar_sinais_vitais()


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[SinaisVitaisOut])
def listar_ep(cod_ep_urgenc: int):
    return sinais_vitais_service.listar_por_ep(cod_ep_urgenc)


@router.get("/funcionario/{id_func}", response_model=List[SinaisVitaisOut])
def listar_funcionario(id_func: int):
    return sinais_vitais_service.listar_por_funcionario(id_func)


@router.get("/{id_sinal}", response_model=SinaisVitaisOut)
def obter(id_sinal: int):
    return sinais_vitais_service.obter_sinal_vital(id_sinal)


@router.post("/", response_model=SinaisVitaisOut, status_code=201)
def criar(data: SinaisVitaisCreate):
    return sinais_vitais_service.criar_sinal_vital(data.model_dump())


@router.put("/{id_sinal}", response_model=SinaisVitaisOut)
def atualizar(id_sinal: int, data: SinaisVitaisUpdate):
    return sinais_vitais_service.atualizar_sinal_vital(
        id_sinal,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_sinal}")
def remover(id_sinal: int):
    return sinais_vitais_service.remover_sinal_vital(id_sinal)