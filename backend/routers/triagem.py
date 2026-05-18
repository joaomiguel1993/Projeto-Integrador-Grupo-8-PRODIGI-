from typing import List
from fastapi import APIRouter
from backend.schemas.triagem import TriagemCreate, TriagemUpdate, TriagemOut
from backend.services import triagem_service

router = APIRouter(prefix="/api/v1/triagem", tags=["Triagem"])


@router.get("/", response_model=List[TriagemOut])
def listar():
    return triagem_service.listar_triagens()


@router.get("/cor/{cor_triagem}", response_model=List[TriagemOut])
def listar_cor(cor_triagem: str):
    return triagem_service.listar_por_cor(cor_triagem)


@router.get("/funcionario/{id_func}", response_model=List[TriagemOut])
def listar_funcionario(id_func: int):
    return triagem_service.listar_por_funcionario(id_func)


@router.get("/{cod_ep_urgenc}", response_model=TriagemOut)
def obter(cod_ep_urgenc: int):
    return triagem_service.obter_triagem(cod_ep_urgenc)


@router.post("/", response_model=TriagemOut, status_code=201)
def criar(data: TriagemCreate):
    return triagem_service.criar_triagem(data.model_dump())


@router.put("/{cod_ep_urgenc}", response_model=TriagemOut)
def atualizar(cod_ep_urgenc: int, data: TriagemUpdate):
    return triagem_service.atualizar_triagem(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_ep_urgenc}")
def remover(cod_ep_urgenc: int):
    return triagem_service.remover_triagem(cod_ep_urgenc)