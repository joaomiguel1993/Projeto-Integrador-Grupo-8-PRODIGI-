from backend.db import run_query

def select_all_trabalhos():
    return run_query("""
        SELECT
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
        FROM trabalha
        ORDER BY idfunc ASC, idhosp ASC
    """)

def select_trabalho_by_ids(idfunc: int, idhosp: int):
    return run_query("""
        SELECT
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
        FROM trabalha
        WHERE idfunc = %s AND idhosp = %s
    """, (idfunc, idhosp))

def select_trabalhos_by_funcionario(idfunc: int):
    return run_query("""
        SELECT
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
        FROM trabalha
        WHERE idfunc = %s
        ORDER BY idhosp ASC
    """, (idfunc,))

def select_trabalhos_by_hospital(idhosp: int):
    return run_query("""
        SELECT
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
        FROM trabalha
        WHERE idhosp = %s
        ORDER BY idfunc ASC
    """, (idhosp,))

def insert_trabalho(idfunc: int, idhosp: int, ativo: bool = True):
    return run_query("""
        INSERT INTO trabalha (idfunc, idhosp, ativo)
        VALUES (%s, %s, %s)
        RETURNING
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
    """, (idfunc, idhosp, ativo))

def update_trabalho(idfunc: int, idhosp: int, ativo=None):
    campos = []
    valores = []

    if ativo is not None:
        campos.append("ativo = %s")
        valores.append(ativo)

    if len(campos) == 0:
        return select_trabalho_by_ids(idfunc, idhosp)

    valores.extend([idfunc, idhosp])

    query = f"""
        UPDATE trabalha
        SET {', '.join(campos)}
        WHERE idfunc = %s AND idhosp = %s
        RETURNING
            idfunc AS id_func,
            idhosp AS id_hosp,
            ativo
    """
    return run_query(query, tuple(valores))

def delete_trabalho(idfunc: int, idhosp: int):
    return run_query("""
        DELETE FROM trabalha
        WHERE idfunc = %s AND idhosp = %s
        RETURNING
            idfunc AS id_func,
            idhosp AS id_hosp
    """, (idfunc, idhosp))