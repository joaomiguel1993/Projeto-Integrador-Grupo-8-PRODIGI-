from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.ato import AtoCreate, AtoUpdate, AtoOut
from backend.services import atos_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/atos", tags=["Atos"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[AtoOut])
def listar_atos(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return atos_service.listar_atos()


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[AtoOut])
def listar_atos_por_episodio(cod_ep_urgenc: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return atos_service.listar_atos_por_episodio(cod_ep_urgenc)


@router.get("/{id_ato}", response_model=AtoOut)
def obter_ato(id_ato: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return atos_service.obter_ato(id_ato)


@router.post("/", response_model=AtoOut, status_code=201)
def criar_ato(
    data: AtoCreate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["medico", "enfermeiro"], current_user)

    result = atos_service.criar_ato(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_ATO",
        detalhe=f"Ato clínico criado para episódio {data.cod_ep_urgenc}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_ato}", response_model=AtoOut)
def atualizar_ato(
    id_ato: int,
    data: AtoUpdate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["medico", "enfermeiro"], current_user)

    result = atos_service.atualizar_ato(
        id_ato,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_ATO",
        detalhe=f"Ato clínico {id_ato} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_ato}")
def remover_ato(
    id_ato: int,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["admin"], current_user)

    result = atos_service.remover_ato(id_ato)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_ATO",
        detalhe=f"Ato clínico {id_ato} removido.",
        ip=get_client_ip(request),
    )

    return result