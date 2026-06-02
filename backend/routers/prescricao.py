from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.prescricao import PrescricaoCreate, PrescricaoUpdate, PrescricaoOut
from backend.services import prescricoes_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/prescricoes", tags=["Prescrições"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[PrescricaoOut])
def listar_prescricoes(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return prescricoes_service.listar_prescricoes()


@router.get("/ato/{id_ato}", response_model=List[PrescricaoOut])
def obter_prescricoes_por_ato(id_ato: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return prescricoes_service.obter_prescricoes_por_ato(id_ato)


@router.get("/{id_prescricao}", response_model=PrescricaoOut)
def obter_prescricao(id_prescricao: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return prescricoes_service.obter_prescricao(id_prescricao)


@router.post("/", response_model=PrescricaoOut, status_code=201)
def criar_prescricao(
    data: PrescricaoCreate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["medico"], current_user)

    result = prescricoes_service.criar_prescricao(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_PRESCRICAO",
        detalhe=f"Prescrição criada para ato {data.id_ato}, medicamento {data.cod_medicamento}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_prescricao}", response_model=PrescricaoOut)
def atualizar_prescricao(
    id_prescricao: int,
    data: PrescricaoUpdate,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["medico"], current_user)

    result = prescricoes_service.atualizar_prescricao(
        id_prescricao,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_PRESCRICAO",
        detalhe=f"Prescrição {id_prescricao} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_prescricao}")
def remover_prescricao(
    id_prescricao: int,
    request: Request,
    current_user=Depends(get_current_user),
):
    require_roles(["admin"], current_user)

    result = prescricoes_service.remover_prescricao(id_prescricao)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_PRESCRICAO",
        detalhe=f"Prescrição {id_prescricao} removida.",
        ip=get_client_ip(request),
    )

    return result