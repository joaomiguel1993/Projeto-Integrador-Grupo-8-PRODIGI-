from fastapi import APIRouter, HTTPException, Request, status
from typing import Optional
from datetime import datetime
from backend.schemas.ato import (
    AtoCreate, AtoResponse, AtoUpdate,
    FuncionarioAtoResponse, PrescricaoAtoResponse
)
from backend.services.atos_service import (
    get_atos_service, get_ato_service, get_atos_por_episodio_service,
    criar_ato_service, atualizar_ato_service,
    get_funcionarios_do_ato_service, get_prescricoes_do_ato_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/atos", tags=["Atos"])

def get_safe_ip(request: Request) -> str:
    return request.client.host if request.client else "0.0.0.0"

@router.get("/", response_model=list[AtoResponse])
def get_atos(request: Request):
    insert_log(request.headers.get("X-Username"), "LISTAR_ATOS", "...", get_safe_ip(request))
    return get_atos_service()

@router.get("/episodio/{cod_ep_urgenc}", response_model=list[AtoResponse])
def get_atos_por_episodio(cod_ep_urgenc: int, request: Request):
    return get_atos_por_episodio_service(cod_ep_urgenc)

@router.get("/{id_ato}", response_model=AtoResponse)
def get_ato(id_ato: int, request: Request):
    res = get_ato_service(id_ato)
    if not res: raise HTTPException(404, "Ato não encontrado")
    return res

@router.get("/{id_ato}/funcionarios", response_model=list[FuncionarioAtoResponse])
def get_funcionarios_ato(id_ato: int, request: Request):
    return get_funcionarios_do_ato_service(id_ato)

@router.get("/{id_ato}/prescricoes", response_model=list[PrescricaoAtoResponse])
def get_prescricoes_ato(id_ato: int, request: Request):
    return get_prescricoes_do_ato_service(id_ato)

@router.post("/", response_model=AtoResponse, status_code=status.HTTP_201_CREATED)
def post_ato(data: AtoCreate, request: Request):
    return criar_ato_service(data)

@router.put("/{id_ato}", response_model=AtoResponse)
def put_ato(id_ato: int, data: AtoUpdate, request: Request):
    res = atualizar_ato_service(id_ato, data)
    if not res: raise HTTPException(404, "Ato não encontrado")
    return res