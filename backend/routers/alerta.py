from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.alerta import AlertaCreate, AlertaUpdate, AlertaOut
from backend.services import alerta_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/alertas", tags=["Alertas"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[AlertaOut])
def listar_alertas(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)
    return alerta_service.listar_alertas()


@router.get("/prescricao/{id_prescricao}", response_model=List[AlertaOut])
def obter_alertas_por_prescricao(id_prescricao: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)
    return alerta_service.obter_alertas_por_prescricao(id_prescricao)


@router.get("/{cod_alerta}", response_model=AlertaOut)
def obter_alerta(cod_alerta: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)
    return alerta_service.obter_alerta(cod_alerta)


@router.post("/", response_model=AlertaOut, status_code=201)
def criar_alerta(data: AlertaCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = alerta_service.criar_alerta(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_ALERTA",
        detalhe=f"Alerta criado para prescrição {data.id_prescricao}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_alerta}", response_model=AlertaOut)
def atualizar_alerta(cod_alerta: int, data: AlertaUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = alerta_service.atualizar_alerta(
        cod_alerta,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_ALERTA",
        detalhe=f"Alerta {cod_alerta} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_alerta}/resolver/{id_func}", response_model=AlertaOut)
def resolver_alerta(cod_alerta: int, id_func: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["medico"], current_user)

    result = alerta_service.marcar_alerta_resolvido(cod_alerta, id_func)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="RESOLVER_ALERTA",
        detalhe=f"Alerta {cod_alerta} resolvido pelo funcionário {id_func}.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_alerta}")
def remover_alerta(cod_alerta: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = alerta_service.remover_alerta(cod_alerta)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_ALERTA",
        detalhe=f"Alerta {cod_alerta} removido.",
        ip=get_client_ip(request),
    )

    return result