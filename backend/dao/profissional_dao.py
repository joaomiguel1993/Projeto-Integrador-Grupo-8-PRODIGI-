from backend.db import run_query

def get_profissionais():
    return run_query("""
        SELECT f.NumFunc, f.Sexo, f.TipoFunc,
               CASE WHEN m.NumFunc IS NOT NULL THEN 'Medico' 
                    WHEN e.NumFunc IS NOT NULL THEN 'Enfermeiro' END as Especialidade,
               m.Estagiario
        FROM Funcionario f
        LEFT JOIN Medico m ON f.NumFunc = m.NumFunc
        LEFT JOIN Enfermeiro e ON f.NumFunc = e.NumFunc
    """)

def get_profissional(numfunc: int):
    return run_query("""
        SELECT f.*, m.Estagiario
        FROM Funcionario f
        LEFT JOIN Medico m ON f.NumFunc = m.NumFunc
        WHERE f.NumFunc = %s
    """, (numfunc,))