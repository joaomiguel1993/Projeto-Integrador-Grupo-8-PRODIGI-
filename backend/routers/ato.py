from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.ato import (
    AtoCreate,
    AtoResponse,
    FuncionarioAtoResponse,
    PrescricaoAtoResponse
)
from backend.services.atos_service import (
    get_atos_service,
    get_ato_service,
    get_atos_por_episodio_service,
    criar_ato_service,
    get_funcionarios_do_ato_service,
    get_prescricoes_do_ato_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(
    prefix="/atos",
    tags=["Atos"]
)

@router.get("/", response_model=list[AtoResponse])
def get_atos(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_atos_service()
    insert_log(
        username=username,
        acao="LISTAR_ATOS",
        detalhe="Listagem de atos consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/episodio/{cod_ep_urgenc}", response_model=list[AtoResponse])
def get_atos_por_episodio(cod_ep_urgenc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_atos_por_episodio_service(cod_ep_urgenc)
    insert_log(
        username=username,
        acao="LISTAR_ATOS_EPISODIO",
        detalhe=f"Atos do episódio {cod_ep_urgenc} consultados.",
        ip=request.client.host
    )
    return resultado

@router.get("/{id_ato}", response_model=AtoResponse)
def get_ato(id_ato: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_ato_service(id_ato)
    if not resultado:
        raise HTTPException(status_code=404, detail="Ato não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_ATO",
        detalhe=f"Ato {id_ato} consultado.",
        ip=request.client.host
    )
    return resultado

@router.post("/", response_model=AtoResponse, status_code=status.HTTP_201_CREATED)
def post_ato(data: AtoCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_ato_service(data)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar o ato")
    insert_log(
        username=username,
        acao="CRIAR_ATO",
        detalhe=f"Ato do tipo {data.tipo} criado para episódio {data.cod_ep_urgenc}.",
        ip=request.client.host
    )
    return resultado

@router.get("/{id_ato}/funcionarios", response_model=list[FuncionarioAtoResponse])
def get_funcionarios_ato(id_ato: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_funcionarios_do_ato_service(id_ato)
    insert_log(
        username=username,
        acao="LISTAR_FUNCIONARIOS_ATO",
        detalhe=f"Funcionários do ato {id_ato} consultados.",
        ip=request.client.host
    )
    return resultado

@router.get("/{id_ato}/prescricoes", response_model=list[PrescricaoAtoResponse])
def get_prescricoes_ato(id_ato: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_prescricoes_do_ato_service(id_ato)
    insert_log(
        username=username,
        acao="LISTAR_PRESCRICOES_ATO",
        detalhe=f"Prescrições do ato {id_ato} consultadas.",
        ip=request.client.host
    )
    return resultado