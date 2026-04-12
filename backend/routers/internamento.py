from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/internamentos",
    tags=["Internamentos"]
)

@router.get("/")
def get_internamentos():
    query = """
        SELECT NumUtent, NomeHosp, DataInternamento, DataAlta
        FROM Internados ORDER BY DataInternamento DESC;
    """
    return run_query(query)

@router.get("/{num_utent}/{data_internamento}")
def get_internamento(num_utent: int, data_internamento: str):
    query = """
        SELECT NumUtent, NomeHosp, DataInternamento, DataAlta
        FROM Internados WHERE NumUtent = %s AND DataInternamento = %s;
    """
    resultado = run_query(query, (num_utent, data_internamento))
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado