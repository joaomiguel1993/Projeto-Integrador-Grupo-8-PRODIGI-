from backend.db import run_query

def select_all_triagens():
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica
        FROM triagem
        ORDER BY datahorainicio DESC
    """)

def select_triagem_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica
        FROM triagem
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))
