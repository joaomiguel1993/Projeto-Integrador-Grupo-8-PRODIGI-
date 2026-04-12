from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/atos",
    tags=["Atos"]
)

@router.get("/")
def get_atos():
    query = """
        SELECT CodAto, CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim, Tipo
        FROM Atos ORDER BY CodAto;
    """
    return run_query(query)

@router.get("/{cod}/{nome_hosp}")
def get_atos_episodio(cod: int, nome_hosp: str):
    query = """
        SELECT CodAto, CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim, Tipo
        FROM Atos WHERE CodEpUrgenc = %s AND NomeHosp = %s ORDER BY DataHoraInicio;
    """
    resultado = run_query(query, (cod, nome_hosp))
    if not resultado:
        raise HTTPException(status_code=404, detail="Atos não encontrados")
    return resultado