from backend.db import run_query

def select_all_hospitais():
    return run_query("""
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        ORDER BY Nome
    """)

def select_hospital_by_id(id_hosp: int):
    return run_query("""
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        WHERE IdHosp = %s
    """, (id_hosp,))