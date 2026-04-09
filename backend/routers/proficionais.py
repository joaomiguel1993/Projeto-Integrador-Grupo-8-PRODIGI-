from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/proficionais",
    tags=["Profissionais"]
)

@router.get("/")
def get_proficionais():
    query = """
        SELECT
            f.NumFunc,
            f.Sexo,
            f.TipoFunc,
            m.Estagiario
        FROM Funcionario f
        LEFT JOIN Medico m ON f.NumFunc = m.NumFunc
        LEFT JOIN Enfermeiro e ON f.NumFunc = e.NumFunc
        ORDER BY f.NumFunc;
    """
    return run_query(query)

@router.get("/{num_func}")
def get_profissional(num_func: int):
    query = """
        SELECT
            f.NumFunc,
            f.Sexo,
            f.TipoFunc,
            m.Estagiario
        FROM Funcionario f
        LEFT JOIN Medico m ON f.NumFunc = m.NumFunc
        LEFT JOIN Enfermeiro e ON f.NumFunc = e.NumFunc
        WHERE f.NumFunc = %s;
    """
    resultado = run_query(query, (num_func,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    return resultado