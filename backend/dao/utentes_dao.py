from backend.db import run_query

def select_all_utentes():
    return run_query("""
        SELECT numutent, nome, nif, datanasc, sexo, localidade
        FROM utente
        ORDER BY nome
    """)

def select_utente_by_id(num_utente: int):
    return run_query("""
        SELECT numutent, nome, nif, datanasc, sexo, localidade
        FROM utente
        WHERE numutent = %s
    """, (num_utente,))
