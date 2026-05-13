from backend.db import run_query


def select_all_utente_antecedentes():
    return run_query("""
        SELECT
            numutent AS num_utent,
            codantecedente AS cod_antecedente,
            dataregisto AS data_registo
        FROM utenteantecedente
        ORDER BY numutent ASC, codantecedente ASC
    """)


def select_utente_antecedente_by_ids(numutent: int, codantecedente: int):
    return run_query("""
        SELECT numutent, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE numutent = %s AND codantecedente = %s
    """, (numutent, codantecedente))


def select_antecedentes_by_utente(numutent: int):
    return run_query("""
        SELECT numutent, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE numutent = %s
        ORDER BY dataregisto DESC
    """, (numutent,))


def select_utentes_by_antecedente(codantecedente: int):
    return run_query("""
        SELECT numutent, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE codantecedente = %s
        ORDER BY dataregisto DESC
    """, (codantecedente,))


def insert_utente_antecedente(numutent: int, codantecedente: int, dataregisto=None):
    if dataregisto is None:
        return run_query("""
            INSERT INTO utenteantecedente (numutent, codantecedente)
            VALUES (%s, %s)
            RETURNING numutent, codantecedente, dataregisto
        """, (numutent, codantecedente))

    return run_query("""
        INSERT INTO utenteantecedente (numutent, codantecedente, dataregisto)
        VALUES (%s, %s, %s)
        RETURNING numutent, codantecedente, dataregisto
    """, (numutent, codantecedente, dataregisto))


def update_utente_antecedente(numutent: int, codantecedente: int, dataregisto=None):
    campos = []
    valores = []

    if dataregisto is not None:
        campos.append("dataregisto = %s")
        valores.append(dataregisto)

    if len(campos) == 0:
        return select_utente_antecedente_by_ids(numutent, codantecedente)

    valores.extend([numutent, codantecedente])

    query = f"""
        UPDATE utenteantecedente
        SET {', '.join(campos)}
        WHERE numutent = %s AND codantecedente = %s
        RETURNING numutent, codantecedente, dataregisto
    """
    return run_query(query, tuple(valores))


def delete_utente_antecedente(numutent: int, codantecedente: int):
    return run_query("""
        DELETE FROM utenteantecedente
        WHERE numutent = %s AND codantecedente = %s
        RETURNING numutent, codantecedente
    """, (numutent, codantecedente))