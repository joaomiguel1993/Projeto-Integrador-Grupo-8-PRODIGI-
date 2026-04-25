from backend.db import run_query

def select_all_prescricoes():
    return run_query("""
        SELECT idprescricao, idato, descricao, datahorapresc
        FROM prescreve
        ORDER BY datahorapresc DESC
    """)

def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, descricao, datahorapresc
        FROM prescreve
        WHERE idprescricao = %s
    """, (id_prescricao,))
