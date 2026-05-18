from typing import List
from fastapi import APIRouter
from backend.schemas.contexto_prescricao import ContextoPrescricaoOut
from backend.services import contexto_prescricao_service

router = APIRouter(prefix="/api/v1/contexto-prescricao", tags=["Contexto Prescrição"])


@router.get("/", response_model=List[ContextoPrescricaoOut])
def listar():
    return contexto_prescricao_service.listar_contextos_prescricao()


@router.get("/prescricao/{id_prescricao}", response_model=List[ContextoPrescricaoOut])
def obter_prescricao(id_prescricao: int):
    return contexto_prescricao_service.obter_por_prescricao(id_prescricao)


@router.get("/ato/{id_ato}", response_model=List[ContextoPrescricaoOut])
def listar_ato(id_ato: int):
    return contexto_prescricao_service.listar_por_ato(id_ato)


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[ContextoPrescricaoOut])
def listar_ep(cod_ep_urgenc: int):
    return contexto_prescricao_service.listar_por_ep(cod_ep_urgenc)


@router.get("/utente/{nif}", response_model=List[ContextoPrescricaoOut])
def listar_nif(nif: str):
    return contexto_prescricao_service.listar_por_nif(nif)


@router.get("/medicamento/{cod_medicamento}", response_model=List[ContextoPrescricaoOut])
def listar_medicamento(cod_medicamento: int):
    return contexto_prescricao_service.listar_por_medicamento(cod_medicamento)