from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.internamento import (
    InternamentoResponse,
    InternamentoCreate,
    InternamentoUpdate
)
from backend.services.internamentos_service import (
    get_internamentos_service,
    get_internamento_service,
    create_internamento_service,
    update_internamento_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/internamentos", tags=["Internamentos"])


def get_client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("/", response_model=list[InternamentoResponse])
def get_internamentos(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_internamentos_service()

    insert_log(
        username=username,
        acao="LISTAR_INTERNAMENTOS",
        detalhe="Listagem de internamentos consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.get("/{cod_internamento}", response_model=InternamentoResponse)
def get_internamento(cod_internamento: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_internamento_service(cod_internamento)

    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")

    insert_log(
        username=username,
        acao="CONSULTAR_INTERNAMENTO",
        detalhe=f"Internamento {cod_internamento} consultado.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/", response_model=InternamentoResponse, status_code=status.HTTP_201_CREATED)
def post_internamento(data: InternamentoCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = create_internamento_service(data)

    insert_log(
        username=username,
        acao="CRIAR_INTERNAMENTO",
        detalhe=f"Internamento criado para episódio {data.codepurgenc}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.put("/{cod_internamento}", response_model=InternamentoResponse)
def put_internamento(cod_internamento: int, data: InternamentoUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = update_internamento_service(cod_internamento, data)

    insert_log(
        username=username,
        acao="ATUALIZAR_INTERNAMENTO",
        detalhe=f"Internamento {cod_internamento} atualizado.",
        ip=get_client_ip(request)
    )

    return resultado