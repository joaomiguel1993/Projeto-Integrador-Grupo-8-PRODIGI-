from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.utenteantecedente import (
    UtenteAntecedenteCreate,
    UtenteAntecedenteUpdate,
    UtenteAntecedenteOut,
)
from backend.services import utenteantecedente_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/utente-antecedentes", tags=["Utente Antecedentes"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[UtenteAntecedenteOut])
def listar_utente_antecedentes(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return utenteantecedente_service.listar_utente_antecedentes()


@router.get("/utente/{num_utent}", response_model=List[UtenteAntecedenteOut])
def listar_antecedentes_por_utente(num_utent: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return utenteantecedente_service.listar_antecedentes_por_utente(num_utent)


@router.get("/antecedente/{cod_antecedente}", response_model=List[UtenteAntecedenteOut])
def listar_utentes_por_antecedente(cod_antecedente: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return utenteantecedente_service.listar_utentes_por_antecedente(cod_antecedente)


@router.get("/{num_utent}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def obter_utente_antecedente(num_utent: int, cod_antecedente: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return utenteantecedente_service.obter_utente_antecedente(num_utent, cod_antecedente)


@router.post("/", response_model=UtenteAntecedenteOut, status_code=201)
def criar_utente_antecedente(data: UtenteAntecedenteCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = utenteantecedente_service.criar_utente_antecedente(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_UTENTE_ANTECEDENTE",
        detalhe=f"Antecedente {data.model_dump().get('cod_antecedente')} associado ao utente {data.model_dump().get('num_utent')}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{num_utent}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def atualizar_utente_antecedente(num_utent: int, cod_antecedente: int, data: UtenteAntecedenteUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = utenteantecedente_service.atualizar_utente_antecedente(
        num_utent,
        cod_antecedente,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_UTENTE_ANTECEDENTE",
        detalhe=f"Associação utente {num_utent} — antecedente {cod_antecedente} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{num_utent}/{cod_antecedente}")
def remover_utente_antecedente(num_utent: int, cod_antecedente: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = utenteantecedente_service.remover_utente_antecedente(num_utent, cod_antecedente)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_UTENTE_ANTECEDENTE",
        detalhe=f"Associação utente {num_utent} — antecedente {cod_antecedente} removida.",
        ip=get_client_ip(request),
    )

    return result