from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.medicacaoativa import (
    MedicacaoAtivaCreate,
    MedicacaoAtivaUpdate,
    MedicacaoAtivaOut,
)
from backend.services import medicacaoativa_service
from backend.auth.jwt_utils import get_current_user
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/medicacao-ativa", tags=["Medicação Ativa"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[MedicacaoAtivaOut])
def listar_medicacoes_ativas():
    return medicacaoativa_service.listar_medicacoes_ativas()


@router.get("/utente/{num_utent}", response_model=List[MedicacaoAtivaOut])
def listar_medicacoes_ativas_por_utente(num_utent: int):
    return medicacaoativa_service.listar_medicacoes_ativas_por_utente(num_utent)


@router.get("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def obter_medicacao_ativa(cod_medicacao_ativa: int):
    return medicacaoativa_service.obter_medicacao_ativa(cod_medicacao_ativa)


@router.post("/", response_model=MedicacaoAtivaOut, status_code=201)
def criar_medicacao_ativa(
    data: MedicacaoAtivaCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = medicacaoativa_service.criar_medicacao_ativa(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa criada para utente {data.num_utent}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_medicacao_ativa}", response_model=MedicacaoAtivaOut)
def atualizar_medicacao_ativa(
    cod_medicacao_ativa: int,
    data: MedicacaoAtivaUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = medicacaoativa_service.atualizar_medicacao_ativa(
        cod_medicacao_ativa,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa {cod_medicacao_ativa} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_medicacao_ativa}")
def remover_medicacao_ativa(
    cod_medicacao_ativa: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = medicacaoativa_service.remover_medicacao_ativa(cod_medicacao_ativa)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa {cod_medicacao_ativa} removida.",
        ip=get_client_ip(request),
    )

    return result