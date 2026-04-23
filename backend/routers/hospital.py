from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/hospitais",
    tags=["Hospitais"]
)


@router.get("/")
def get_hospitais():
    query = """
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        ORDER BY Nome;
    """
    return run_query(query)


@router.get("/{id_hosp}")
def get_hospital(id_hosp: int):
    query = """
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        WHERE IdHosp = %s;
    """
    resultado = run_query(query, (id_hosp,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    return resultado