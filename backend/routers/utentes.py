from fastapi import APIRouter, HTTPException, Request

from backend.schemas.utente import UtenteResponse, UtenteCreate
from backend.services.utentes_service import (
    get_utentes_service,
    get_utente_service,
    create_utente_service,
    update_utente_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/utentes", tags=["Utentes"])


def get_client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("/", response_model=list[UtenteResponse])
def get_utentes(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utentes_service()

    insert_log(
        username=username,
        acao="LISTAR_UTENTES",
        detalhe="Listagem de utentes consultada.",
        ip=get_client_ip(request)
    )

    return resultado


@router.get("/{num_utente}", response_model=UtenteResponse)
def get_utente(num_utente: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utente_service(num_utente)

    if not resultado:
        raise HTTPException(status_code=404, detail="Utente não encontrado")

    insert_log(
        username=username,
        acao="CONSULTAR_UTENTE",
        detalhe=f"Utente {num_utente} consultado.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/", response_model=UtenteResponse)
def criar_utente(payload: UtenteCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = create_utente_service(
        nome=payload.nome,
        nif=payload.nif,
        datanasc=payload.datanasc,
        sexo=payload.sexo,
        localidade=payload.localidade
    )

    insert_log(
        username=username,
        acao="CRIAR_UTENTE",
        detalhe=f"Utente criado: {resultado['numutent']} - {resultado['nome']}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.put("/{num_utente}", response_model=UtenteResponse)
def atualizar_utente(num_utente: int, payload: UtenteCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")

    resultado = update_utente_service(
        num_utente=num_utente,
        nome=payload.nome,
        nif=payload.nif,
        datanasc=payload.datanasc,
        sexo=payload.sexo,
        localidade=payload.localidade
    )

    insert_log(
        username=username,
        acao="ATUALIZAR_UTENTE",
        detalhe=f"Utente atualizado: {num_utente} - {payload.nome}.",
        ip=get_client_ip(request)
    )

    return resultado