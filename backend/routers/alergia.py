from fastapi import APIRouter, Request, Depends
from backend.schemas.alergia import (
    AlergiaCreate,
    AlergiaUpdate,
    AlergiaOut,
    AlergiaEstatisticasOut,
)
from backend.services import alergias_service
from backend.auth.jwt_utils import get_current_user, require_roles
from backend.dao.logs_dao import insert_log
from typing import List

router = APIRouter(prefix="/v1/alergias", tags=["Alergias"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/estatisticas/predict", response_model=List[AlergiaEstatisticasOut])
def estatisticas_para_ia(current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)
    return alergias_service.obter_dados_treino_ia()


@router.get("/utente/{num_utent}", response_model=List[AlergiaOut])
def listar_por_utente(num_utent: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return alergias_service.listar_por_utente(num_utent)


@router.get("/{cod_alergia}", response_model=AlergiaOut)
def obter(cod_alergia: int, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico", "enfermeiro"], current_user)
    return alergias_service.obter_alergia(cod_alergia)


@router.post("/", response_model=AlergiaOut, status_code=201)
def criar(data: AlergiaCreate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = alergias_service.criar_alergia(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_ALERGIA",
        detalhe=f"Alergia criada para utente {data.num_utent}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_alergia}", response_model=AlergiaOut)
def atualizar(cod_alergia: int, data: AlergiaUpdate, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin", "medico"], current_user)

    result = alergias_service.atualizar_alergia(cod_alergia, data.model_dump(exclude_unset=True))

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_ALERGIA",
        detalhe=f"Alergia {cod_alergia} atualizada.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_alergia}")
def remover(cod_alergia: int, request: Request, current_user=Depends(get_current_user)):
    require_roles(["admin"], current_user)

    result = alergias_service.remover_alergia(cod_alergia)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_ALERGIA",
        detalhe=f"Alergia {cod_alergia} removida.",
        ip=get_client_ip(request),
    )

    return result