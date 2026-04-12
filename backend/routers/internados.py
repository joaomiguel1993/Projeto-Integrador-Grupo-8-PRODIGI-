from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/internamentos",
    tags=["Internamentos"]
)

@router.get("/")
def get_internamentos():
    query = """
        SELECT
            NumUtent,
            NomeHosp,
            DataInternamento,
            DataAlta
        FROM Internados
        ORDER BY DataInternamento DESC;
    """
    return run_query(query)

@router.get("/{num_utent}/{data_internamento}")
def get_internamento(num_utent: int, data_internamento: str):
    query = """
        SELECT
            NumUtent,
            NomeHosp,
            DataInternamento,
            DataAlta
        FROM Internados
        WHERE NumUtent = %s AND DataInternamento = %s;
    """
    resultado = run_query(query, (num_utent, data_internamento))
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado

@router.post("/")
def criar_internamento(num_utent: int, nome_hosp: str, data_internamento: str):
    query = """
        INSERT INTO Internados (NumUtent, NomeHosp, DataInternamento)
        VALUES (%s, %s, %s);
    """
    run_query(query, (num_utent, nome_hosp, data_internamento))
    return {"message": "Internamento criado com sucesso"}