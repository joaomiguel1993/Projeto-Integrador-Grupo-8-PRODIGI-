from backend.db import run_query

def select_all_profissionais():
    return run_query("""
        SELECT IdFunc, Nome, TipoFunc, Sexo
        FROM Funcionario
        ORDER BY Nome
    """)

def select_profissional_by_id(id_func: int):
    return run_query("""
        SELECT IdFunc, Nome, TipoFunc, Sexo
        FROM Funcionario
        WHERE IdFunc = %s
    """, (id_func,))