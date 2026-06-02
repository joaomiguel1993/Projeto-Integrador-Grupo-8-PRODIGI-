from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.utente import (
    UtenteCreate,
    UtenteUpdate,
    UtenteOut,
)
from backend.services import utentes_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/utentes", tags=["Utentes"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[UtenteOut])
def listar_utentes(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro", "rececionista"], current_user)
    return utentes_service.listar_utentes()


@router.get("/nif/{nif}", response_model=UtenteOut)
def obter_utente_por_nif(nif: str, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro", "rececionista"], current_user)
    return utentes_service.obter_utente_por_nif(nif)


@router.get("/{num_utent}", response_model=UtenteOut)
def obter_utente(num_utent: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro", "rececionista"], current_user)
    return utentes_service.obter_utente(num_utent)


@router.post("/", response_model=UtenteOut, status_code=201)
def criar_utente(data: UtenteCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "rececionista"], current_user)

    result = utentes_service.criar_utente(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_UTENTE",
        detalhe=f"Utente com NIF {data.model_dump().get('nif')} criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{num_utent}", response_model=UtenteOut)
def atualizar_utente(num_utent: int, data: UtenteUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "rececionista"], current_user)

    result = utentes_service.atualizar_utente(
        num_utent,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_UTENTE",
        detalhe=f"Utente {num_utent} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{num_utent}")
def remover_utente(num_utent: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = utentes_service.remover_utente(num_utent)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_UTENTE",
        detalhe=f"Utente {num_utent} removido.",
        ip=get_client_ip(request),
    )

    return result