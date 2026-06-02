from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.medicamento import (
    MedicamentoCreate,
    MedicamentoUpdate,
    MedicamentoOut,
)
from backend.services import medicamentos_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/medicamentos", tags=["Medicamentos"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[MedicamentoOut])
def listar_medicamentos(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return medicamentos_service.listar_medicamentos()

@router.get("/{cod_medicamento}", response_model=MedicamentoOut)
def obter_medicamento(cod_medicamento: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return medicamentos_service.obter_medicamento(cod_medicamento)


@router.post("/", response_model=MedicamentoOut, status_code=201)
def criar_medicamento(data: MedicamentoCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = medicamentos_service.criar_medicamento(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_MEDICAMENTO",
        detalhe=f"Medicamento {data.model_dump().get('nome')} criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_medicamento}", response_model=MedicamentoOut)
def atualizar_medicamento(cod_medicamento: int, data: MedicamentoUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = medicamentos_service.atualizar_medicamento(
        cod_medicamento,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_MEDICAMENTO",
        detalhe=f"Medicamento {cod_medicamento} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_medicamento}")
def remover_medicamento(cod_medicamento: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = medicamentos_service.remover_medicamento(cod_medicamento)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_MEDICAMENTO",
        detalhe=f"Medicamento {cod_medicamento} removido.",
        ip=get_client_ip(request),
    )

    return result