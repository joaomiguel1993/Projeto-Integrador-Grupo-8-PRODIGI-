from fastapi import APIRouter
from typing import List

from backend.schemas.profissional import (
    ProfissionalCreate,
    ProfissionalUpdate,
    ProfissionalOut,
)
from backend.services import profissionais_service

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


@router.get("/", response_model=List[ProfissionalOut])
def listar_profissionais():
    return profissionais_service.listar_profissionais()


@router.get("/tipo/{tipo_func}", response_model=List[ProfissionalOut])
def listar_profissionais_por_tipo(tipo_func: str):
    return profissionais_service.listar_profissionais_por_tipo(tipo_func)


@router.get("/{id_func}", response_model=ProfissionalOut)
def obter_profissional(id_func: int):
    return profissionais_service.obter_profissional(id_func)


@router.post("/", response_model=ProfissionalOut, status_code=201)
def criar_profissional(data: ProfissionalCreate):
    return profissionais_service.criar_profissional(data.model_dump())


@router.put("/{id_func}", response_model=ProfissionalOut)
def atualizar_profissional(id_func: int, data: ProfissionalUpdate):
    return profissionais_service.atualizar_profissional(
        id_func,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_func}")
def remover_profissional(id_func: int):
    return profissionais_service.remover_profissional(id_func)