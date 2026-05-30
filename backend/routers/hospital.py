from fastapi import APIRouter, Request, Depends
from typing import List

from backend.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalOut
from backend.services import hospitais_service
from backend.auth.jwt_utils import get_current_user
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/v1/hospitais", tags=["Hospitais"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


@router.get("/", response_model=List[HospitalOut])
def listar_hospitais():
    return hospitais_service.listar_hospitais()


@router.get("/{id_hosp}", response_model=HospitalOut)
def obter_hospital(id_hosp: int):
    return hospitais_service.obter_hospital(id_hosp)


@router.post("/", response_model=HospitalOut, status_code=201)
def criar_hospital(
    data: HospitalCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = hospitais_service.criar_hospital(data.model_dump())

    insert_log(
        username=current_user["username"],
        acao="CRIAR_HOSPITAL",
        detalhe=f"Hospital {data.model_dump().get('nome')} criado.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{id_hosp}", response_model=HospitalOut)
def atualizar_hospital(
    id_hosp: int,
    data: HospitalUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = hospitais_service.atualizar_hospital(
        id_hosp,
        data.model_dump(exclude_unset=True),
    )

    insert_log(
        username=current_user["username"],
        acao="EDITAR_HOSPITAL",
        detalhe=f"Hospital ID {id_hosp} atualizado.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{id_hosp}")
def remover_hospital(
    id_hosp: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = hospitais_service.remover_hospital(id_hosp)

    insert_log(
        username=current_user["username"],
        acao="REMOVER_HOSPITAL",
        detalhe=f"Hospital ID {id_hosp} removido.",
        ip=get_client_ip(request),
    )

    return result