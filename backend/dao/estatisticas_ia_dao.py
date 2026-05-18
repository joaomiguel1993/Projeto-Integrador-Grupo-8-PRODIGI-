from backend.db import run_query


def select_all_estatisticas_ia():
    return run_query("""
        SELECT idhosp, hospitalnome, facility_size_beds,
               contagem_enfermeiros, contagem_medicos, pacientes_ativos
        FROM v_estatisticas_ia
        ORDER BY idhosp
    """)


def select_estatisticas_ia_by_hospital(id_hosp: int):
    return run_query("""
        SELECT idhosp, hospitalnome, facility_size_beds,
               contagem_enfermeiros, contagem_medicos, pacientes_ativos
        FROM v_estatisticas_ia
        WHERE idhosp = %s
    """, (id_hosp,))