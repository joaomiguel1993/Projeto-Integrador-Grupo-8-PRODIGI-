from backend.db import run_query

def select_all_utentes():
    return run_query("""
        SELECT NumUtent, Nome, NIF, DataNasc, Sexo, Localidade
        FROM Utente
        ORDER BY Nome
    """)

def select_utente_by_id(num_utente: int):
    return run_query("""
        SELECT NumUtent, Nome, NIF, DataNasc, Sexo, Localidade
        FROM Utente
        WHERE NumUtent = %s
    """, (num_utente,))