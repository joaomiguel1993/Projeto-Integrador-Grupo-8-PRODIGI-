from fastapi import APIRouter, HTTPException, status
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

router = APIRouter(prefix="/utentes", tags=["Utentes - Antecedentes"])


@router.get("/{numutent}/antecedentes", response_model=list[UtenteAntecedenteDetalheResponse])
def get_antecedentes_utente(numutent: int):
    return get_antecedentes_utente_service(numutent)


@router.post("/{numutent}/antecedentes", response_model=UtenteAntecedenteResponse,
             status_code=status.HTTP_201_CREATED)
def post_antecedente_utente(numutent: int, data: UtenteAntecedenteCreate):
    resultado = adicionar_antecedente_service(numutent, data.codantecedente)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível adicionar o antecedente")
    return resultado


@router.delete("/{numutent}/antecedentes/{codantecedente}",
               status_code=status.HTTP_204_NO_CONTENT)
def delete_antecedente_utente(numutent: int, codantecedente: int):
    resultado = remover_antecedente_service(numutent, codantecedente)
    if not resultado:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado")