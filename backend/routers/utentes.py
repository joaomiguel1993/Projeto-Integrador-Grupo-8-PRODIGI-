from fastapi import APIRouter, HTTPException, Request
from backend.schemas.utente import UtenteResponse
from backend.services.utentes_service import get_utentes_service, get_utente_service
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/utentes", tags=["Utentes"])

@router.get("/", response_model=list[UtenteResponse])
def get_utentes(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_utentes_service()
    insert_log(
        username=username,
        acao="LISTAR_UTENTES",
        detalhe="Listagem de utentes consultada.",
        ip=request.client.host
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
        ip=request.client.host
    )
    return resultado