from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/profissionais",
    tags=["Profissionais"]
)


@router.get("/")
def get_profissionais():
    query = """
        SELECT
            f.IdFunc,
            f.NumFunc,
            f.Nome,
            f.Sexo,
            f.TipoFunc,
            m.Estagiario,
            m.Especialidade
        FROM Funcionario f
        LEFT JOIN Medico m ON f.IdFunc = m.IdFunc
        LEFT JOIN Enfermeiro e ON f.IdFunc = e.IdFunc
        ORDER BY f.IdFunc;
    """
    return run_query(query)


@router.get("/{id_func}")
def get_profissional(id_func: int):
    query = """
        SELECT
            f.IdFunc,
            f.NumFunc,
            f.Nome,
            f.Sexo,
            f.TipoFunc,
            m.Estagiario,
            m.Especialidade
        FROM Funcionario f
        LEFT JOIN Medico m ON f.IdFunc = m.IdFunc
        LEFT JOIN Enfermeiro e ON f.IdFunc = e.IdFunc
        WHERE f.IdFunc = %s;
    """
    resultado = run_query(query, (id_func,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    return resultado