from backend.db import run_query

def select_all_hospitais():
    return run_query("""
        SELECT idhosp, nome, localizacao
        FROM hospital
        ORDER BY nome
    """)

def select_hospital_by_id(id_hosp: int):
    return run_query("""
        SELECT idhosp, nome, localizacao
        FROM hospital
        WHERE idhosp = %s
    """, (id_hosp,))
