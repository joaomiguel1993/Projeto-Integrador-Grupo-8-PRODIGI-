from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.prescricao import (
    PrescricaoResponse,
    PrescricaoCreate,
    PrescricaoUpdate
)
from backend.services.prescricoes_service import (
    get_prescricoes_service,
    get_prescricao_service,
    create_prescricao_service,
    update_prescricao_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/prescricoes", tags=["Prescrições"])


def get_client_ip(request: Request):
    return request.client.host if request.client else None


@router.get("/", response_model=list[PrescricaoResponse])
def get_prescricoes(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_prescricoes_service()

    insert_log(
        username=username,
        acao="LISTAR_PRESCRICOES",
        detalhe="Listagem de prescrições consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.get("/{id_prescricao}", response_model=PrescricaoResponse)
def get_prescricao(id_prescricao: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_prescricao_service(id_prescricao)

    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada")

    insert_log(
        username=username,
        acao="CONSULTAR_PRESCRICAO",
        detalhe=f"Prescrição {id_prescricao} consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/", response_model=PrescricaoResponse, status_code=status.HTTP_201_CREATED)
def post_prescricao(data: PrescricaoCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = create_prescricao_service(
        id_ato=data.idato,
        descricao=data.descricao
    )

    insert_log(
        username=username,
        acao="CRIAR_PRESCRICAO",
        detalhe=f"Prescrição criada para o ato {data.idato}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.put("/{id_prescricao}", response_model=PrescricaoResponse)
def put_prescricao(id_prescricao: int, data: PrescricaoUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = update_prescricao_service(
        id_prescricao=id_prescricao,
        id_ato=data.idato,
        descricao=data.descricao
    )

    insert_log(
        username=username,
        acao="ATUALIZAR_PRESCRICAO",
        detalhe=f"Prescrição {id_prescricao} atualizada.",
        ip=get_client_ip(request)
    )

    return resultado