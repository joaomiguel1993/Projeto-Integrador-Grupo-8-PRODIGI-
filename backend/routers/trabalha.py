from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.trabalha import (
    TrabalhaCreate,
    TrabalhaUpdate,
    TrabalhaOut,
)
from backend.services import trabalha_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/trabalha", tags=["Trabalha"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[TrabalhaOut])
def listar_trabalhos(current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)
    return trabalha_service.listar_trabalhos()


@router.get("/funcionario/{id_func}", response_model=List[TrabalhaOut])
def listar_trabalhos_por_funcionario(id_func: int, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)
    return trabalha_service.listar_trabalhos_por_funcionario(id_func)


@router.get("/hospital/{id_hosp}", response_model=List[TrabalhaOut])
def listar_trabalhos_por_hospital(id_hosp: int, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)
    return trabalha_service.listar_trabalhos_por_hospital(id_hosp)


@router.get("/{id_func}/{id_hosp}", response_model=TrabalhaOut)
def obter_trabalho(id_func: int, id_hosp: int, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)
    return trabalha_service.obter_trabalho(id_func, id_hosp)


@router.post("/", response_model=TrabalhaOut, status_code=201)
def criar_trabalho(data: TrabalhaCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = trabalha_service.criar_trabalho(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_TRABALHA",
        detalhe=f"Associação funcionário {data.model_dump().get('id_func')} — hospital {data.model_dump().get('id_hosp')} criada.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_func}/{id_hosp}", response_model=TrabalhaOut)
def atualizar_trabalho(id_func: int, id_hosp: int, data: TrabalhaUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = trabalha_service.atualizar_trabalho(
        id_func,
        id_hosp,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_TRABALHA",
        detalhe=f"Associação funcionário {id_func} — hospital {id_hosp} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_func}/{id_hosp}")
def remover_trabalho(id_func: int, id_hosp: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = trabalha_service.remover_trabalho(id_func, id_hosp)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_TRABALHA",
        detalhe=f"Associação funcionário {id_func} — hospital {id_hosp} removida.",
        ip=get_client_ip(request),
    )

    return result