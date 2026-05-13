from fastapi import APIRouter
from typing import List

from backend.schemas.ato import AtoCreate, AtoUpdate, AtoOut
from backend.services import atos_service

router = APIRouter(prefix="/atos", tags=["Atos"])


@router.get("/", response_model=List[AtoOut])
def listar_atos():
    return atos_service.listar_atos()


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[AtoOut])
def listar_atos_por_episodio(cod_ep_urgenc: int):
    return atos_service.listar_atos_por_episodio(cod_ep_urgenc)


@router.get("/{id_ato}", response_model=AtoOut)
def obter_ato(id_ato: int):
    return atos_service.obter_ato(id_ato)


@router.post("/", response_model=AtoOut, status_code=201)
def criar_ato(data: AtoCreate):
    return atos_service.criar_ato(data.model_dump())


@router.put("/{id_ato}", response_model=AtoOut)
def atualizar_ato(id_ato: int, data: AtoUpdate):
    return atos_service.atualizar_ato(
        id_ato,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_ato}")
def remover_ato(id_ato: int):
    return atos_service.remover_ato(id_ato)