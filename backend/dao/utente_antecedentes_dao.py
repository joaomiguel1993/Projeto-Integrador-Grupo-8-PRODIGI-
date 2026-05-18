from typing import Optional
from backend.db import run_query


def select_all_utente_antecedentes():
    return run_query("""
        SELECT nif, codantecedente, dataregisto
        FROM utenteantecedente
        ORDER BY dataregisto DESC, nif, codantecedente
    """)


def select_utente_antecedente_by_ids(nif: str, cod_antecedente: int):
    return run_query("""
        SELECT nif, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE nif = %s AND codantecedente = %s
    """, (nif, cod_antecedente))


def select_by_nif(nif: str):
    return run_query("""
        SELECT nif, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE nif = %s
        ORDER BY dataregisto DESC, codantecedente
    """, (nif,))


def select_by_antecedente(cod_antecedente: int):
    return run_query("""
        SELECT nif, codantecedente, dataregisto
        FROM utenteantecedente
        WHERE codantecedente = %s
        ORDER BY dataregisto DESC, nif
    """, (cod_antecedente,))


def insert_utente_antecedente(nif: str, cod_antecedente: int, data_registo: Optional[str] = None):
    if data_registo is None:
        return run_query("""
            INSERT INTO utenteantecedente (nif, codantecedente)
            VALUES (%s, %s)
            RETURNING nif, codantecedente, dataregisto
        """, (nif, cod_antecedente))

    return run_query("""
        INSERT INTO utenteantecedente (nif, codantecedente, dataregisto)
        VALUES (%s, %s, %s)
        RETURNING nif, codantecedente, dataregisto
    """, (nif, cod_antecedente, data_registo))


def update_utente_antecedente(nif: str, cod_antecedente: int, data_registo: Optional[str] = None):
    if data_registo is None:
        return select_utente_antecedente_by_ids(nif, cod_antecedente)

    return run_query("""
        UPDATE utenteantecedente
        SET dataregisto = %s
        WHERE nif = %s AND codantecedente = %s
        RETURNING nif, codantecedente, dataregisto
    """, (data_registo, nif, cod_antecedente))


def delete_utente_antecedente(nif: str, cod_antecedente: int):
    return run_query("""
        DELETE FROM utenteantecedente
        WHERE nif = %s AND codantecedente = %s
        RETURNING nif, codantecedente
    """, (nif, cod_antecedente))