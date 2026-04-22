from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/utentes",
    tags=["Utentes"],
    responses={404: {"description": "Utente não encontrado"}}
)


@router.get("/")
def get_utentes():
    query = """
        SELECT NumUtent, NIF, Nome, DataNasc, Sexo, Localidade
        FROM Utente
        ORDER BY Nome;
    """
    return run_query(query)


@router.get("/{num_utent}")
def get_utente(num_utent: int):
    query = """
        SELECT NumUtent, NIF, Nome, DataNasc, Sexo, Localidade
        FROM Utente
        WHERE NumUtent = %s;
    """
    resultado = run_query(query, (num_utent,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Utente não encontrado")
    return resultado