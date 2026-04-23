from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/atos",
    tags=["Atos"]
)

@router.get("/")
def get_atos():
    query = """
        SELECT IdAto, CodEpUrgenc, DataHoraInicio, DataHoraFim, Tipo
        FROM Ato ORDER BY IdAto;
    """
    return run_query(query)

@router.get("/{id_ato}")
def get_ato(id_ato: int):
    query = """
        SELECT IdAto, CodEpUrgenc, DataHoraInicio, DataHoraFim, Tipo
        FROM Ato WHERE IdAto = %s;
    """
    resultado = run_query(query, (id_ato,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Ato não encontrado")
    return resultado

@router.get("/{id_ato}/funcionarios")
def get_funcionarios_ato(id_ato: int):
    query = """
        SELECT f.IdFunc, f.Nome, f.TipoFunc
        FROM Realiza r
        JOIN Funcionario f ON r.IdFunc = f.IdFunc
        WHERE r.IdAto = %s;
    """
    return run_query(query, (id_ato,))