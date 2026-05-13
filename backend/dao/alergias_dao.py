from backend.db import run_query

def select_alergias_by_utente(numutent: int):
    return run_query("""
        SELECT a.codalergia, a.numutent, a.substancia, a.classeterapeuticaid, a.nivelgravidade
        FROM alergia a
        WHERE a.numutent = %s
    """, (numutent,))

def insert_alergia(numutent: int, substancia: str, classeterapeuticaid: int, nivel: str = None):
    return run_query("""
        INSERT INTO alergia (numutent, substancia, classeterapeuticaid, nivelgravidade)
        VALUES (%s, %s, %s, %s)
        RETURNING codalergia
    """, (numutent, substancia, classeterapeuticaid, nivel))