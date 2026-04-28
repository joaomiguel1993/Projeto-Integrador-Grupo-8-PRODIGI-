from backend.db import run_query
 
def select_all_utilizadores():
    return run_query("""
        SELECT u.idfunc, u.username, f.nome, f.tipofunc
        FROM utilizador u
        JOIN funcionario f ON u.idfunc = f.idfunc
        ORDER BY f.nome
    """)
 
def select_utilizador_by_idfunc(idfunc: int):
    return run_query("""
        SELECT u.idfunc, u.username, f.nome, f.tipofunc
        FROM utilizador u
        JOIN funcionario f ON u.idfunc = f.idfunc
        WHERE u.idfunc = %s
    """, (idfunc,))