from fastapi import APIRouter
from typing import List

from backend.schemas.prescricao import PrescricaoCreate, PrescricaoUpdate, PrescricaoOut
from backend.services import prescricoes_service

router = APIRouter(prefix="/prescricoes", tags=["Prescrições"])


@router.get("/", response_model=List[PrescricaoOut])
def listar_prescricoes():
    return prescricoes_service.listar_prescricoes()


@router.get("/ato/{id_ato}", response_model=List[PrescricaoOut])
def obter_prescricoes_por_ato(id_ato: int):
    return prescricoes_service.obter_prescricoes_por_ato(id_ato)


@router.get("/{id_prescricao}", response_model=PrescricaoOut)
def obter_prescricao(id_prescricao: int):
    return prescricoes_service.obter_prescricao(id_prescricao)


@router.post("/", response_model=PrescricaoOut, status_code=201)
def criar_prescricao(data: PrescricaoCreate):
    return prescricoes_service.criar_prescricao(data.model_dump())


@router.put("/{id_prescricao}", response_model=PrescricaoOut)
def atualizar_prescricao(id_prescricao: int, data: PrescricaoUpdate):
    return prescricoes_service.atualizar_prescricao(
        id_prescricao,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_prescricao}")
def remover_prescricao(id_prescricao: int):
    return prescricoes_service.remover_prescricao(id_prescricao)