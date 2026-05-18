from typing import List
from fastapi import APIRouter
from backend.schemas.realiza import RealizaCreate, RealizaUpdate, RealizaOut
from backend.services import realiza_service

router = APIRouter(prefix="/api/v1/realiza", tags=["Realiza"])


@router.get("/", response_model=List[RealizaOut])
def listar():
    return realiza_service.listar_realizacoes()


@router.get("/ato/{id_ato}", response_model=List[RealizaOut])
def listar_ato(id_ato: int):
    return realiza_service.listar_por_ato(id_ato)


@router.get("/funcionario/{id_func}", response_model=List[RealizaOut])
def listar_funcionario(id_func: int):
    return realiza_service.listar_por_funcionario(id_func)


@router.get("/{id_ato}/{id_func}", response_model=RealizaOut)
def obter(id_ato: int, id_func: int):
    return realiza_service.obter_realizacao(id_ato, id_func)


@router.post("/", response_model=RealizaOut, status_code=201)
def criar(data: RealizaCreate):
    return realiza_service.criar_realizacao(data.model_dump())


@router.put("/{id_ato}/{id_func}", response_model=RealizaOut)
def atualizar(id_ato: int, id_func: int, data: RealizaUpdate):
    return realiza_service.atualizar_realizacao(id_ato, id_func, data.model_dump(exclude_unset=True))


@router.delete("/{id_ato}/{id_func}")
def remover(id_ato: int, id_func: int):
    return realiza_service.remover_realizacao(id_ato, id_func)