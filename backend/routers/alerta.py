from fastapi import APIRouter, HTTPException, status
from backend.schemas.alerta import AlertaCreate, AlertaUpdate, AlertaResponse
from backend.services.alerta_service import (
    get_alertas_service,
    get_alerta_service,
    get_alertas_por_prescricao_service,
    criar_alerta_service,
    atualizar_alerta_service
)

router = APIRouter(prefix="/alertas", tags=["Alertas"])


@router.get("/", response_model=list[AlertaResponse])
def get_alertas():
    return get_alertas_service()


@router.get("/prescricao/{idprescricao}", response_model=list[AlertaResponse])
def get_alertas_por_prescricao(idprescricao: int):
    return get_alertas_por_prescricao_service(idprescricao)


@router.get("/{codalerta}", response_model=AlertaResponse)
def get_alerta(codalerta: int):
    resultado = get_alerta_service(codalerta)
    if not resultado:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return resultado


@router.post("/", response_model=AlertaResponse, status_code=status.HTTP_201_CREATED)
def post_alerta(data: AlertaCreate):
    resultado = criar_alerta_service(data.idprescricao, data.idfunc, data.tipo)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar o alerta")
    return resultado


@router.put("/{codalerta}", response_model=AlertaResponse)
def put_alerta(codalerta: int, data: AlertaUpdate):
    resultado = atualizar_alerta_service(codalerta, data.ignorado, data.justificacao)
    if not resultado:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return resultado