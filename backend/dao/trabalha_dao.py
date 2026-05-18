from typing import Optional
from backend.db import run_query

def select_all_trabalhos():
    return run_query("""
        SELECT idfunc, idhosp, ativo
        FROM trabalha
        ORDER BY idfunc, idhosp
    """)

def select_trabalho_by_ids(id_func: int, id_hosp: int):
    return run_query("""
        SELECT idfunc, idhosp, ativo
        FROM trabalha
        WHERE idfunc = %s AND idhosp = %s
    """, (id_func, id_hosp))

def insert_trabalho(id_func: int, id_hosp: int, ativo: bool = True):
    return run_query("""
        INSERT INTO trabalha (idfunc, idhosp, ativo)
        VALUES (%s, %s, %s)
        RETURNING idfunc, idhosp, ativo
    """, (id_func, id_hosp, ativo))

def update_trabalho(id_func: int, id_hosp: int, ativo: Optional[bool] = None):
    if ativo is None:
        return select_trabalho_by_ids(id_func, id_hosp)

    return run_query("""
        UPDATE trabalha
        SET ativo = %s
        WHERE idfunc = %s AND idhosp = %s
        RETURNING idfunc, idhosp, ativo
    """, (ativo, id_func, id_hosp))

def delete_trabalho(id_func: int, id_hosp: int):
    return run_query("""
        DELETE FROM trabalha
        WHERE idfunc = %s AND idhosp = %s
        RETURNING idfunc, idhosp
    """, (id_func, id_hosp))

def select_trabalhos_by_funcionario(id_func: int):
    return run_query("""
        SELECT idfunc, idhosp, ativo
        FROM trabalha
        WHERE idfunc = %s
        ORDER BY idhosp
    """, (id_func,))


def select_trabalhos_by_hospital(id_hosp: int):
    return run_query("""
        SELECT idfunc, idhosp, ativo
        FROM trabalha
        WHERE idhosp = %s
        ORDER BY idfunc
    """, (id_hosp,))