from fastapi import APIRouter
from typing import List

from backend.schemas.alerta import AlertaCreate, AlertaUpdate, AlertaOut
from backend.services import alerta_service

router = APIRouter(prefix="/alertas", tags=["Alertas"])


@router.get("/", response_model=List[AlertaOut])
def listar_alertas():
    return alerta_service.listar_alertas()


@router.get("/prescricao/{id_prescricao}", response_model=List[AlertaOut])
def obter_alertas_por_prescricao(id_prescricao: int):
    return alerta_service.obter_alertas_por_prescricao(id_prescricao)


@router.get("/{cod_alerta}", response_model=AlertaOut)
def obter_alerta(cod_alerta: int):
    return alerta_service.obter_alerta(cod_alerta)


@router.post("/", response_model=AlertaOut, status_code=201)
def criar_alerta(data: AlertaCreate):
    return alerta_service.criar_alerta(data.model_dump())


@router.put("/{cod_alerta}", response_model=AlertaOut)
def atualizar_alerta(cod_alerta: int, data: AlertaUpdate):
    return alerta_service.atualizar_alerta(
        cod_alerta,
        data.model_dump(exclude_unset=True)
    )


@router.put("/{cod_alerta}/resolver/{id_func}", response_model=AlertaOut)
def resolver_alerta(cod_alerta: int, id_func: int):
    return alerta_service.marcar_alerta_resolvido(cod_alerta, id_func)


@router.delete("/{cod_alerta}")
def remover_alerta(cod_alerta: int):
    return alerta_service.remover_alerta(cod_alerta)