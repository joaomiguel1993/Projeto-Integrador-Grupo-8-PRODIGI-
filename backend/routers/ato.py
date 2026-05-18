from typing import List
from fastapi import APIRouter
from backend.schemas.ato import AtoCreate, AtoUpdate, AtoOut
from backend.services import ato_service

router = APIRouter(prefix="/api/v1/ato", tags=["Ato"])


@router.get("/", response_model=List[AtoOut])
def listar():
    return ato_service.listar_atos()


@router.get("/ep-urgencia/{cod_ep_urgenc}", response_model=List[AtoOut])
def listar_ep_urgencia(cod_ep_urgenc: int):
    return ato_service.listar_por_cod_ep_urgenc(cod_ep_urgenc)


@router.get("/{id_ato}", response_model=AtoOut)
def obter(id_ato: int):
    return ato_service.obter_ato(id_ato)


@router.post("/", response_model=AtoOut, status_code=201)
def criar(data: AtoCreate):
    return ato_service.criar_ato(data.model_dump())


@router.put("/{id_ato}", response_model=AtoOut)
def atualizar(id_ato: int, data: AtoUpdate):
    return ato_service.atualizar_ato(id_ato, data.model_dump(exclude_unset=True))


@router.delete("/{id_ato}")
def remover(id_ato: int):
    return ato_service.remover_ato(id_ato)