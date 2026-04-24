from fastapi import APIRouter, HTTPException
from backend.schemas.utente import UtenteResponse
from backend.services.utentes_service import get_utentes_service, get_utente_service

router = APIRouter(prefix="/utentes", tags=["Utentes"])

@router.get("/", response_model=list[UtenteResponse])
def get_utentes():
    return get_utentes_service()

@router.get("/{num_utente}", response_model=UtenteResponse)
def get_utente(num_utente: int):
    resultado = get_utente_service(num_utente)
    if not resultado:
        raise HTTPException(status_code=404, detail="Utente não encontrado")
    return resultado