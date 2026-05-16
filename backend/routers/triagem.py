from fastapi import APIRouter
from typing import List

from backend.schemas.triagem import (
    TriagemCreate,
    TriagemUpdate,
    TriagemOut,
)
from backend.services import triagens_service

router = APIRouter(prefix="/v1/triagens", tags=["Triagens"])


@router.get("/", response_model=List[TriagemOut])
def listar_triagens():
    return triagens_service.listar_triagens()


@router.get("/{cod_ep_urgenc}", response_model=TriagemOut)
def obter_triagem(cod_ep_urgenc: int):
    return triagens_service.obter_triagem(cod_ep_urgenc)


@router.post("/", response_model=TriagemOut, status_code=201)
def criar_triagem(data: TriagemCreate):
    return triagens_service.criar_triagem(data.model_dump())
    

@router.get("/hospital/{idhosp}", response_model=List[TriagemOut])
def listar_triagens_por_hospital(idhosp: int):
    return triagens_service.listar_triagens_por_hospital(idhosp)


@router.put("/{cod_ep_urgenc}", response_model=TriagemOut)
def atualizar_triagem(cod_ep_urgenc: int, data: TriagemUpdate):
    return triagens_service.atualizar_triagem(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_ep_urgenc}")
def remover_triagem(cod_ep_urgenc: int):
    return triagens_service.remover_triagem(cod_ep_urgenc)


