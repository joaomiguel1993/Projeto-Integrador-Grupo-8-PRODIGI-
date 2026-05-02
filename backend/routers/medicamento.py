from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.medicamento import (
    MedicamentoResponse,
    MedicamentoCreate,
    MedicamentoUpdate
)
from backend.services.medicamentos_service import (
    get_medicamentos_service,
    get_medicamento_service,
    create_medicamento_service,
    update_medicamento_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])


def get_client_ip(request: Request):
    return request.client.host if request.client else None


@router.get("/", response_model=list[MedicamentoResponse])
def get_medicamentos(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicamentos_service()

    insert_log(
        username=username,
        acao="LISTAR_MEDICAMENTOS",
        detalhe="Listagem de medicamentos consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.get("/{cod_medicamento}", response_model=MedicamentoResponse)
def get_medicamento(cod_medicamento: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicamento_service(cod_medicamento)

    if not resultado:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")

    insert_log(
        username=username,
        acao="CONSULTAR_MEDICAMENTO",
        detalhe=f"Medicamento {cod_medicamento} consultado.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/", response_model=MedicamentoResponse, status_code=status.HTTP_201_CREATED)
def post_medicamento(data: MedicamentoCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = create_medicamento_service(
        nome=data.nome,
        principioativo=data.principioativo
    )

    insert_log(
        username=username,
        acao="CRIAR_MEDICAMENTO",
        detalhe=f"Medicamento criado: {data.nome}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.put("/{cod_medicamento}", response_model=MedicamentoResponse)
def put_medicamento(cod_medicamento: int, data: MedicamentoUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = update_medicamento_service(
        cod_medicamento=cod_medicamento,
        nome=data.nome,
        principioativo=data.principioativo
    )

    insert_log(
        username=username,
        acao="ATUALIZAR_MEDICAMENTO",
        detalhe=f"Medicamento {cod_medicamento} atualizado.",
        ip=get_client_ip(request)
    )

    return resultado