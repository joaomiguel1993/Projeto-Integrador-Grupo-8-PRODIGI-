from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/internados",
    tags=["Internados"]
)

@router.get("/")
def get_internados():
    query = """
        SELECT
            NumUtent,
            NomeHosp,
            DataInternamento,
            DataAlta
        FROM Internados
        ORDER BY NumUtent, DataInternamento;
    """
    return run_query(query)

@router.get("/{num_utent}")
def get_internado(num_utent: int):
    query = """
        SELECT
            NumUtent,
            NomeHosp,
            DataInternamento,
            DataAlta
        FROM Internados
        WHERE NumUtent = %s
        ORDER BY DataInternamento;
    """
    resultado = run_query(query, (num_utent,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado