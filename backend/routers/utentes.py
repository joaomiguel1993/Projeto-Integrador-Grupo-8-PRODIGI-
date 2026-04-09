# backend/routers/utentes.py

from fastapi import APIRouter

from ..db import run_query


router = APIRouter(
    prefix="/utentes",
    tags=["Utentes"],
    responses={404: {"description": "Utente não encontrado"}}
)


@router.get("/")
def get_utentes():
    """
    Lista todos os utentes da base de dados (tabela `Utente`).
    """
    return run_query("SELECT * FROM Utente;")