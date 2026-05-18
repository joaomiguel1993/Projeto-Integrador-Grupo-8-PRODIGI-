from typing import List
from fastapi import APIRouter
from backend.schemas.alerta import AlertaCreate, AlertaUpdate, AlertaOut
from backend.services import alerta_service

router = APIRouter(prefix="/api/v1/alerta", tags=["Alerta"])


@router.get("/", response_model=List[AlertaOut])
def listar():
    return alerta_service.listar_alertas()


@router.get("/prescricao/{id_prescricao}", response_model=List[AlertaOut])
def listar_prescricao(id_prescricao: int):
    return alerta_service.listar_por_prescricao(id_prescricao)


@router.get("/funcionario/{id_func}", response_model=List[AlertaOut])
def listar_funcionario(id_func: int):
    return alerta_service.listar_por_funcionario(id_func)


@router.get("/severidade/{severidade}", response_model=List[AlertaOut])
def listar_severidade(severidade: str):
    return alerta_service.listar_por_severidade(severidade)


@router.get("/resolvido/{resolvido}", response_model=List[AlertaOut])
def listar_resolvido(resolvido: bool):
    return alerta_service.listar_por_resolvido(resolvido)


@router.get("/{cod_alerta}", response_model=AlertaOut)
def obter(cod_alerta: int):
    return alerta_service.obter_alerta(cod_alerta)


@router.post("/", response_model=AlertaOut, status_code=201)
def criar(data: AlertaCreate):
    return alerta_service.criar_alerta(data.model_dump())


@router.put("/{cod_alerta}", response_model=AlertaOut)
def atualizar(cod_alerta: int, data: AlertaUpdate):
    return alerta_service.atualizar_alerta(
        cod_alerta,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_alerta}")
def remover(cod_alerta: int):
    return alerta_service.remover_alerta(cod_alerta)