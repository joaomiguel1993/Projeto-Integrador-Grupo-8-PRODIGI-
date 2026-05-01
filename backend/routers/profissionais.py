from fastapi import APIRouter, HTTPException, Request
from backend.schemas.profissional import (
    ProfissionalResponse,
    ProfissionalCreate,
    ProfissionalUpdate
)
from backend.services.profissionais_service import (
    get_profissionais_service,
    get_profissional_service,
    create_profissional_service,
    update_profissional_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


@router.get("/", response_model=list[ProfissionalResponse])
def get_profissionais(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_profissionais_service()
    insert_log(
        username=username,
        acao="LISTAR_PROFISSIONAIS",
        detalhe="Listagem de profissionais consultada.",
        ip=request.client.host
    )
    return resultado


@router.get("/{id_func}", response_model=ProfissionalResponse)
def get_profissional(id_func: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_profissional_service(id_func)
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_PROFISSIONAL",
        detalhe=f"Profissional {id_func} consultado.",
        ip=request.client.host
    )
    return resultado


@router.post("/", response_model=ProfissionalResponse)
def create_profissional(data: ProfissionalCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = create_profissional_service(
        nome=data.nome,
        tipofunc=data.tipofunc,
        sexo=data.sexo
    )
    insert_log(
        username=username,
        acao="CRIAR_PROFISSIONAL",
        detalhe=f"Profissional {data.nome} criado.",
        ip=request.client.host
    )
    return resultado


@router.put("/{id_func}", response_model=ProfissionalResponse)
def update_profissional(id_func: int, data: ProfissionalUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = update_profissional_service(
        id_func=id_func,
        nome=data.nome,
        tipofunc=data.tipofunc,
        sexo=data.sexo
    )
    insert_log(
        username=username,
        acao="ATUALIZAR_PROFISSIONAL",
        detalhe=f"Profissional {id_func} atualizado.",
        ip=request.client.host
    )
    return resultado