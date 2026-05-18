from typing import List
from fastapi import APIRouter
from backend.schemas.log_atividade import (
    LogAtividadeCreate,
    LogAtividadeUpdate,
    LogAtividadeOut,
)
from backend.services import log_atividade_service

router = APIRouter(prefix="/api/v1/log-atividade", tags=["Log Atividade"])


@router.get("/", response_model=List[LogAtividadeOut])
def listar():
    return log_atividade_service.listar_logs()


@router.get("/username/{username}", response_model=List[LogAtividadeOut])
def listar_username(username: str):
    return log_atividade_service.listar_por_username(username)


@router.get("/acao/{acao}", response_model=List[LogAtividadeOut])
def listar_acao(acao: str):
    return log_atividade_service.listar_por_acao(acao)


@router.get("/ip/{ip}", response_model=List[LogAtividadeOut])
def listar_ip(ip: str):
    return log_atividade_service.listar_por_ip(ip)


@router.get("/{id_log}", response_model=LogAtividadeOut)
def obter(id_log: int):
    return log_atividade_service.obter_log(id_log)


@router.post("/", response_model=LogAtividadeOut, status_code=201)
def criar(data: LogAtividadeCreate):
    return log_atividade_service.criar_log(data.model_dump())


@router.put("/{id_log}", response_model=LogAtividadeOut)
def atualizar(id_log: int, data: LogAtividadeUpdate):
    return log_atividade_service.atualizar_log(
        id_log,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_log}")
def remover(id_log: int):
    return log_atividade_service.remover_log(id_log)