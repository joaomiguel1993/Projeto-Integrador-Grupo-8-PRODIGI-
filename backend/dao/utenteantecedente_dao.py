from backend.db import run_query


def select_antecedentes_by_utente(numutent: int):
    return run_query("""
        SELECT ua.numutent, ua.codantecedente, ua.dataregisto,
               a.nome, a.tipo
        FROM utenteantecedente ua
        JOIN antecedente a ON ua.codantecedente = a.codantecedente
        WHERE ua.numutent = %s
        ORDER BY ua.dataregisto DESC
    """, (numutent,))


def insert_utenteantecedente(numutent: int, codantecedente: int):
    return run_query("""
        INSERT INTO utenteantecedente (numutent, codantecedente)
        VALUES (%s, %s)
        RETURNING numutent, codantecedente, dataregisto
    """, (numutent, codantecedente))


def delete_utenteantecedente(numutent: int, codantecedente: int):
    return run_query("""
        DELETE FROM utenteantecedente
        WHERE numutent = %s AND codantecedente = %s
        RETURNING numutent, codantecedente
    """, (numutent, codantecedente))