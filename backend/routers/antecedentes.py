from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.antecedente import (
    AntecedenteCreate,
    AntecedenteUpdate,
    AntecedenteOut,
)
from backend.services import antecedentes_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/antecedentes", tags=["Antecedentes"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[AntecedenteOut])
def listar_antecedentes(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return antecedentes_service.listar_antecedentes()


@router.get("/{cod_antecedente}", response_model=AntecedenteOut)
def obter_antecedente(cod_antecedente: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return antecedentes_service.obter_antecedente(cod_antecedente)


@router.post("/", response_model=AntecedenteOut, status_code=201)
def criar_antecedente(data: AntecedenteCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = antecedentes_service.criar_antecedente(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_ANTECEDENTE",
        detalhe=f"Antecedente criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_antecedente}", response_model=AntecedenteOut)
def atualizar_antecedente(cod_antecedente: int, data: AntecedenteUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = antecedentes_service.atualizar_antecedente(
        cod_antecedente,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_ANTECEDENTE",
        detalhe=f"Antecedente {cod_antecedente} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_antecedente}")
def remover_antecedente(cod_antecedente: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = antecedentes_service.remover_antecedente(cod_antecedente)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_ANTECEDENTE",
        detalhe=f"Antecedente {cod_antecedente} removido.",
        ip=get_client_ip(request),
    )

    return result