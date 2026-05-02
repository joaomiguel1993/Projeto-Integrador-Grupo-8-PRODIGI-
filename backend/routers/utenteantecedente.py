from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.utenteantecedente import (
    UtenteAntecedenteCreate,
    UtenteAntecedenteResponse,
    UtenteAntecedenteDetalheResponse
)
from backend.services.utenteantecedente_service import (
    get_antecedentes_utente_service,
    adicionar_antecedente_service,
    remover_antecedente_service
)
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/utentes", tags=["Utentes - Antecedentes"])


def get_client_ip(request: Request):
    return request.client.host if request.client else None


@router.get("/{numutent}/antecedentes", response_model=list[UtenteAntecedenteDetalheResponse])
def get_antecedentes_utente(numutent: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_antecedentes_utente_service(numutent)

    insert_log(
        username=username,
        acao="LISTAR_ANTECEDENTES_UTENTE",
        detalhe=f"Antecedentes do utente {numutent} consultados.",
        ip=get_client_ip(request)
    )

    return resultado


@router.post("/{numutent}/antecedentes", response_model=UtenteAntecedenteResponse, status_code=status.HTTP_201_CREATED)
def post_antecedente_utente(numutent: int, data: UtenteAntecedenteCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = adicionar_antecedente_service(numutent, data.codantecedente)

    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível adicionar o antecedente")

    insert_log(
        username=username,
        acao="ADICIONAR_ANTECEDENTE_UTENTE",
        detalhe=f"Antecedente {data.codantecedente} adicionado ao utente {numutent}.",
        ip=get_client_ip(request)
    )

    return resultado


@router.delete("/{numutent}/antecedentes/{codantecedente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_antecedente_utente(numutent: int, codantecedente: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = remover_antecedente_service(numutent, codantecedente)

    if not resultado:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado")

    insert_log(
        username=username,
        acao="REMOVER_ANTECEDENTE_UTENTE",
        detalhe=f"Antecedente {codantecedente} removido do utente {numutent}.",
        ip=get_client_ip(request)
    )