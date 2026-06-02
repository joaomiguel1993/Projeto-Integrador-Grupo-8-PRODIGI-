from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.triagem import (
    TriagemCreate,
    TriagemUpdate,
    TriagemOut,
)
from backend.services import triagens_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/triagens", tags=["Triagens"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[TriagemOut])
def listar_triagens(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return triagens_service.listar_triagens()


@router.get("/hospital/{idhosp}", response_model=List[TriagemOut])
def listar_triagens_por_hospital(idhosp: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return triagens_service.listar_triagens_por_hospital(idhosp)


@router.get("/{cod_ep_urgenc}", response_model=TriagemOut)
def obter_triagem(cod_ep_urgenc: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return triagens_service.obter_triagem(cod_ep_urgenc)


@router.post("/", response_model=TriagemOut, status_code=201)
def criar_triagem(
    data: TriagemCreate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["enfermeiro", "medico"], current_user)

    result = triagens_service.criar_triagem(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="GRAVAR_TRIAGEM",
        detalhe=f"Triagem gravada para episódio {data.cod_ep_urgenc}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_ep_urgenc}", response_model=TriagemOut)
def atualizar_triagem(
    cod_ep_urgenc: int,
    data: TriagemUpdate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["enfermeiro", "medico"], current_user)

    result = triagens_service.atualizar_triagem(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_TRIAGEM",
        detalhe=f"Triagem do episódio {cod_ep_urgenc} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_ep_urgenc}")
def remover_triagem(
    cod_ep_urgenc: int,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["admin"], current_user)

    result = triagens_service.remover_triagem(cod_ep_urgenc)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_TRIAGEM",
        detalhe=f"Triagem do episódio {cod_ep_urgenc} removida.",
        ip=get_client_ip(request),
    )

    return result