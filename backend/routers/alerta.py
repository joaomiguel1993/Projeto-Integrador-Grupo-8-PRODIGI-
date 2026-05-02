from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.alerta import AlertaCreate, AlertaUpdate, AlertaResponse
from backend.services.alerta_service import (
    get_alertas_service,
    get_alerta_service,
    get_alertas_por_prescricao_service,
    criar_alerta_service,
    atualizar_alerta_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/alertas", tags=["Alertas"])


@router.get("/", response_model=list[AlertaResponse])
def get_alertas(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_alertas_service()
    insert_log(
        username=username,
        acao="LISTAR_ALERTAS",
        detalhe="Listagem de alertas consultada.",
        ip=request.client.host
    )
    return resultado


@router.get("/prescricao/{idprescricao}", response_model=list[AlertaResponse])
def get_alertas_por_prescricao(idprescricao: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_alertas_por_prescricao_service(idprescricao)
    insert_log(
        username=username,
        acao="LISTAR_ALERTAS_PRESCRICAO",
        detalhe=f"Alertas da prescrição {idprescricao} consultados.",
        ip=request.client.host
    )
    return resultado


@router.get("/{codalerta}", response_model=AlertaResponse)
def get_alerta(codalerta: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_alerta_service(codalerta)
    if not resultado:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_ALERTA",
        detalhe=f"Alerta {codalerta} consultado.",
        ip=request.client.host
    )
    return resultado


@router.post("/", response_model=AlertaResponse, status_code=status.HTTP_201_CREATED)
def post_alerta(data: AlertaCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_alerta_service(data.idprescricao, data.idfunc, data.tipo)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar o alerta")
    insert_log(
        username=username,
        acao="CRIAR_ALERTA",
        detalhe=f"Alerta do tipo {data.tipo} criado para prescrição {data.idprescricao}.",
        ip=request.client.host
    )
    return resultado


@router.put("/{codalerta}", response_model=AlertaResponse)
def put_alerta(codalerta: int, data: AlertaUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = atualizar_alerta_service(codalerta, data.ignorado, data.justificacao)
    if not resultado:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    insert_log(
        username=username,
        acao="ATUALIZAR_ALERTA",
        detalhe=f"Alerta {codalerta} atualizado.",
        ip=request.client.host
    )
    return resultado