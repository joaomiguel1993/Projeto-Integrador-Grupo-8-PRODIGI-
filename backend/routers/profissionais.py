from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.profissional import (
    ProfissionalCreate,
    ProfissionalUpdate,
    ProfissionalOut,
)
from backend.services import profissionais_service
from backend.routers.auth import get_current_user
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[ProfissionalOut])
def listar_profissionais():
    return profissionais_service.listar_profissionais()


@router.get("/{id_func}", response_model=ProfissionalOut)
def obter_profissional(id_func: int):
    return profissionais_service.obter_profissional(id_func)


@router.post("/", response_model=ProfissionalOut, status_code=201)
def criar_profissional(
    data: ProfissionalCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = profissionais_service.criar_profissional(data.model_dump())

    insert_log(
        username=current_user["username"],
        acao="CRIAR_FUNCIONARIO",
        detalhe=f"Funcionário ID {data.model_dump().get('idfunc')} criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_func}", response_model=ProfissionalOut)
def atualizar_profissional(
    id_func: int,
    data: ProfissionalUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = profissionais_service.atualizar_profissional(
        id_func,
        data.model_dump(exclude_unset=True),
    )

    insert_log(
        username=current_user["username"],
        acao="EDITAR_FUNCIONARIO",
        detalhe=f"Funcionário ID {id_func} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_func}")
def remover_profissional(
    id_func: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = profissionais_service.remover_profissional(id_func)

    insert_log(
        username=current_user["username"],
        acao="REMOVER_FUNCIONARIO",
        detalhe=f"Funcionário ID {id_func} removido.",
        ip=get_client_ip(request),
    )

    return result