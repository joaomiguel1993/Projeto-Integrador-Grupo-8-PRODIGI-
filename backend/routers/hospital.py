from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/hospitais",
    tags=["Hospitais"]
)

@router.get("/")
def get_hospitais():
    query = """
        SELECT NomeHosp, Morada, Telefone FROM Hospitais ORDER BY NomeHosp;
    """
    return run_query(query)

@router.get("/{nome_hosp}")
def get_hospital(nome_hosp: str):
    query = """
        SELECT NomeHosp, Morada, Telefone FROM Hospitais WHERE NomeHosp = %s;
    """
    resultado = run_query(query, (nome_hosp,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    return resultado