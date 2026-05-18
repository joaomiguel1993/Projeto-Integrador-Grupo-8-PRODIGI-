from backend.db import run_query


def select_all_realiza():
    return run_query("""
        SELECT idato, idfunc
        FROM realiza
        ORDER BY idato, idfunc
    """)


def select_realiza_by_ids(id_ato: int, id_func: int):
    return run_query("""
        SELECT idato, idfunc
        FROM realiza
        WHERE idato = %s AND idfunc = %s
    """, (id_ato, id_func))


def select_realiza_by_ato(id_ato: int):
    return run_query("""
        SELECT idato, idfunc
        FROM realiza
        WHERE idato = %s
        ORDER BY idfunc
    """, (id_ato,))


def select_realiza_by_func(id_func: int):
    return run_query("""
        SELECT idato, idfunc
        FROM realiza
        WHERE idfunc = %s
        ORDER BY idato
    """, (id_func,))


def insert_realiza(id_ato: int, id_func: int):
    return run_query("""
        INSERT INTO realiza (idato, idfunc)
        VALUES (%s, %s)
        RETURNING idato, idfunc
    """, (id_ato, id_func))


def update_realiza(id_ato_original: int, id_func_original: int, novo_id_ato=None, novo_id_func=None):
    campos = []
    valores = []

    if novo_id_ato is not None:
        campos.append("idato = %s")
        valores.append(novo_id_ato)

    if novo_id_func is not None:
        campos.append("idfunc = %s")
        valores.append(novo_id_func)

    if not campos:
        return select_realiza_by_ids(id_ato_original, id_func_original)

    valores.extend([id_ato_original, id_func_original])

    query = f"""
        UPDATE realiza
        SET {', '.join(campos)}
        WHERE idato = %s AND idfunc = %s
        RETURNING idato, idfunc
    """
    return run_query(query, tuple(valores))


def delete_realiza(id_ato: int, id_func: int):
    return run_query("""
        DELETE FROM realiza
        WHERE idato = %s AND idfunc = %s
        RETURNING idato, idfunc
    """, (id_ato, id_func))