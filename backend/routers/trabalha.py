from fastapi import APIRouter
from typing import List

from backend.schemas.trabalha import (
    TrabalhaCreate,
    TrabalhaUpdate,
    TrabalhaOut,
)
from backend.services import trabalha_service

router = APIRouter(prefix="/trabalha", tags=["Trabalha"])


@router.get("/", response_model=List[TrabalhaOut])
def listar_trabalhos():
    return trabalha_service.listar_trabalhos()


@router.get("/funcionario/{id_func}", response_model=List[TrabalhaOut])
def listar_trabalhos_por_funcionario(id_func: int):
    return trabalha_service.listar_trabalhos_por_funcionario(id_func)


@router.get("/hospital/{id_hosp}", response_model=List[TrabalhaOut])
def listar_trabalhos_por_hospital(id_hosp: int):
    return trabalha_service.listar_trabalhos_por_hospital(id_hosp)


@router.get("/{id_func}/{id_hosp}", response_model=TrabalhaOut)
def obter_trabalho(id_func: int, id_hosp: int):
    return trabalha_service.obter_trabalho(id_func, id_hosp)


@router.post("/", response_model=TrabalhaOut, status_code=201)
def criar_trabalho(data: TrabalhaCreate):
    return trabalha_service.criar_trabalho(data.model_dump())


@router.put("/{id_func}/{id_hosp}", response_model=TrabalhaOut)
def atualizar_trabalho(id_func: int, id_hosp: int, data: TrabalhaUpdate):
    return trabalha_service.atualizar_trabalho(
        id_func,
        id_hosp,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_func}/{id_hosp}")
def remover_trabalho(id_func: int, id_hosp: int):
    return trabalha_service.remover_trabalho(id_func, id_hosp)