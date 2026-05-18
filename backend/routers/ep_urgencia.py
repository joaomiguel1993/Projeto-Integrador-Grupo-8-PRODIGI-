from typing import List
from fastapi import APIRouter
from backend.schemas.ep_urgencia import (
    EpUrgenciaCreate,
    EpUrgenciaUpdate,
    EpUrgenciaOut,
)
from backend.services import ep_urgencia_service

router = APIRouter(prefix="/api/v1/ep-urgencia", tags=["Episódio Urgência"])


@router.get("/", response_model=List[EpUrgenciaOut])
def listar():
    return ep_urgencia_service.listar_episodios()


@router.get("/nif/{nif}", response_model=List[EpUrgenciaOut])
def listar_nif(nif: str):
    return ep_urgencia_service.listar_por_nif(nif)


@router.get("/hospital/{id_hosp}", response_model=List[EpUrgenciaOut])
def listar_hospital(id_hosp: int):
    return ep_urgencia_service.listar_por_hospital(id_hosp)


@router.get("/estado/{estado}", response_model=List[EpUrgenciaOut])
def listar_estado(estado: str):
    return ep_urgencia_service.listar_por_estado(estado)


@router.get("/{cod_ep_urgenc}", response_model=EpUrgenciaOut)
def obter(cod_ep_urgenc: int):
    return ep_urgencia_service.obter_episodio(cod_ep_urgenc)


@router.post("/", response_model=EpUrgenciaOut, status_code=201)
def criar(data: EpUrgenciaCreate):
    return ep_urgencia_service.criar_episodio(data.model_dump())


@router.put("/{cod_ep_urgenc}", response_model=EpUrgenciaOut)
def atualizar(cod_ep_urgenc: int, data: EpUrgenciaUpdate):
    return ep_urgencia_service.atualizar_episodio(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_ep_urgenc}")
def remover(cod_ep_urgenc: int):
    return ep_urgencia_service.remover_episodio(cod_ep_urgenc)