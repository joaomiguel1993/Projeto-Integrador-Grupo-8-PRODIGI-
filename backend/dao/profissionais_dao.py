from backend.db import run_query

def select_all_profissionais():
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo
        FROM funcionario
        ORDER BY nome
    """)

def select_profissional_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo
        FROM funcionario
        WHERE idfunc = %s
    """, (id_func,))
