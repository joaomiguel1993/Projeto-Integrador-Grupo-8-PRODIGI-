from backend.db import run_query


def select_all_enfermeiros():
    return run_query("""
        SELECT idfunc
        FROM enfermeiro
        ORDER BY idfunc
    """)


def select_enfermeiro_by_id(id_func: int):
    return run_query("""
        SELECT idfunc
        FROM enfermeiro
        WHERE idfunc = %s
    """, (id_func,))


def insert_enfermeiro(id_func: int):
    return run_query("""
        INSERT INTO enfermeiro (idfunc)
        VALUES (%s)
        RETURNING idfunc
    """, (id_func,))


def delete_enfermeiro(id_func: int):
    return run_query("""
        DELETE FROM enfermeiro
        WHERE idfunc = %s
        RETURNING idfunc
    """, (id_func,))