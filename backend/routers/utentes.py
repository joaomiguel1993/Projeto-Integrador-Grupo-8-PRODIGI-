from fastapi import APIRouter, HTTPException
from backend.repositories.utentes_repository import (
    listar_utentes,
    obter_utente,
    listar_episodios_utente,
    listar_antecedentes_utente,
    listar_medicacao_ativa_utente
)

router = APIRouter(
    prefix="/utentes",
    tags=["Utentes"],
    responses={404: {"description": "Utente não encontrado"}}
)

@router.get("/")
def get_utentes():
    return listar_utentes()

@router.get("/{num_utent}")
def get_utente(num_utent: int):
    resultado = obter_utente(num_utent)
    if not resultado:
        raise HTTPException(status_code=404, detail="Utente não encontrado")
    return resultado

@router.get("/{num_utent}/episodios")
def get_episodios_utente(num_utent: int):
    return listar_episodios_utente(num_utent)

@router.get("/{num_utent}/antecedentes")
def get_antecedentes_utente(num_utent: int):
    return listar_antecedentes_utente(num_utent)

@router.get("/{num_utent}/medicacao-ativa")
def get_medicacao_ativa_utente(num_utent: int):
    return listar_medicacao_ativa_utente(num_utent)