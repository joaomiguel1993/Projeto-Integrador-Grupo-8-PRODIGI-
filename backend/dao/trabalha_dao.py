from backend.db import run_query


def select_funcionarios_by_hospital(idhosp: int):
    return run_query("""
        SELECT
            t.idfunc,
            t.idhosp,
            t.ativo,
            f.nome,
            f.tipofunc
        FROM trabalha t
        JOIN funcionario f ON t.idfunc = f.idfunc
        WHERE t.idhosp = %s
        ORDER BY f.nome
    """, (idhosp,))


def select_hospitais_by_funcionario(idfunc: int):
    return run_query("""
        SELECT
            t.idfunc,
            t.idhosp,
            t.ativo,
            h.nome AS nome_hospital,
            h.localizacao
        FROM trabalha t
        JOIN hospital h ON t.idhosp = h.idhosp
        WHERE t.idfunc = %s
        ORDER BY h.nome
    """, (idfunc,))


def insert_trabalha(idfunc: int, idhosp: int):
    return run_query("""
        INSERT INTO trabalha (idfunc, idhosp)
        VALUES (%s, %s)
        RETURNING idfunc, idhosp, ativo
    """, (idfunc, idhosp))


def update_trabalha_ativo(idfunc: int, idhosp: int, ativo: bool):
    return run_query("""
        UPDATE trabalha
        SET ativo = %s
        WHERE idfunc = %s AND idhosp = %s
        RETURNING idfunc, idhosp, ativo
    """, (ativo, idfunc, idhosp))


def delete_trabalha(idfunc: int, idhosp: int):
    return run_query("""
        DELETE FROM trabalha
        WHERE idfunc = %s AND idhosp = %s
        RETURNING idfunc, idhosp
    """, (idfunc, idhosp))


def insert_trabalha_safe(idfunc: int, idhosp: int):
    return run_query("""
        INSERT INTO trabalha (idfunc, idhosp)
        VALUES (%s, %s)
        ON CONFLICT (idfunc, idhosp) DO UPDATE SET ativo = TRUE
        RETURNING idfunc, idhosp, ativo
    """, (idfunc, idhosp))