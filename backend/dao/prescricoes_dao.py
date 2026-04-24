from backend.db import run_query

def select_all_prescricoes():
    return run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        ORDER BY DataHoraPresc DESC
    """)

def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdPrescricao = %s
    """, (id_prescricao,))