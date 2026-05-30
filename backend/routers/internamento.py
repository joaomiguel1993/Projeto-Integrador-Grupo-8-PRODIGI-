from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.internamento import (
    InternamentoCreate,
    InternamentoUpdate,
    InternamentoOut,
)
from backend.services import internamentos_service
from backend.auth.jwt_utils import get_current_user
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/internamentos", tags=["Internamentos"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[InternamentoOut])
def listar_internamentos():
    return internamentos_service.listar_internamentos()


@router.get("/hospital/{idhosp}", response_model=List[InternamentoOut])
def listar_internamentos_por_hospital(idhosp: int):
    return internamentos_service.listar_internamentos_por_hospital(idhosp)


@router.get("/episodio/{cod_ep_urgenc}", response_model=InternamentoOut)
def obter_internamento_por_episodio(cod_ep_urgenc: int):
    return internamentos_service.obter_internamento_por_episodio(cod_ep_urgenc)


@router.get("/{cod_internamento}", response_model=InternamentoOut)
def obter_internamento(cod_internamento: int):
    return internamentos_service.obter_internamento(cod_internamento)


@router.post("/", response_model=InternamentoOut, status_code=201)
def criar_internamento(
    data: InternamentoCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = internamentos_service.criar_internamento(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_INTERNAMENTO",
        detalhe=f"Internamento criado para episódio {data.cod_ep_urgenc}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_internamento}", response_model=InternamentoOut)
def atualizar_internamento(
    cod_internamento: int,
    data: InternamentoUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = internamentos_service.atualizar_internamento(
        cod_internamento,
        data.model_dump(exclude_unset=True)
    )

    campos = data.model_dump(exclude_unset=True)
    acao = "ALTA_INTERNAMENTO" if "data_hora_alta" in campos else "ATUALIZAR_INTERNAMENTO"

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao=acao,
        detalhe=f"Internamento {cod_internamento} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_internamento}")
def remover_internamento(
    cod_internamento: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = internamentos_service.remover_internamento(cod_internamento)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_INTERNAMENTO",
        detalhe=f"Internamento {cod_internamento} removido.",
        ip=get_client_ip(request),
    )

    return result