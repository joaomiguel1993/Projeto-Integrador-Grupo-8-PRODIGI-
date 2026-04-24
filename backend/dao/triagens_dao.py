from backend.db import run_query

def select_all_triagens():
    return run_query("""
        SELECT CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, Sintomas,
               Temperatura, FreqCard, FreqResp, SpO2, Sistolica, Diastolica
        FROM Triagem
        ORDER BY DataHoraInicio DESC
    """)

def select_triagem_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, Sintomas,
               Temperatura, FreqCard, FreqResp, SpO2, Sistolica, Diastolica
        FROM Triagem
        WHERE CodEpUrgenc = %s
    """, (cod_ep_urgenc,))