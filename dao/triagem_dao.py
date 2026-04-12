from backend.db import run_query

def get_triagens_todos():
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, DataHoraTriagem, Prioridade, Temperatura, 
               PressaoSistolica, PressaoDiastolica, Observacoes, NumFuncTriagem
        FROM Triagem ORDER BY DataHoraTriagem DESC
    """)
    return result if result else []

def get_triagens_hospital(nomehosp: str):
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, DataHoraTriagem, Prioridade, Temperatura, 
               PressaoSistolica, PressaoDiastolica, Observacoes, NumFuncTriagem
        FROM Triagem WHERE NomeHosp = %s ORDER BY DataHoraTriagem DESC
    """, (nomehosp,))
    return result if result else []

def get_triagem(cod: int, nomehosp: str):
    result = run_query("SELECT ... WHERE CodEpUrgenc = %s AND NomeHosp = %s", (cod, nomehosp))
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return None

def insert_triagem(cod: int, nomehosp: str, datahoratriagem: str, prioridade: str):
    return run_query("""
        INSERT INTO Triagem (CodEpUrgenc, NomeHosp, DataHoraTriagem, Prioridade)
        VALUES (%s, %s, %s, %s)
    """, (cod, nomehosp, datahoratriagem, prioridade))

def insert_triagem_completa(cod: int, nomehosp: str, datahoratriagem: str, prioridade: str, 
                           temperatura: float, pressaosistolica: int, pressaodiastolica: int, 
                           observacoes: str, numfunctriagem: int):
    return run_query("""
        INSERT INTO Triagem (CodEpUrgenc, NomeHosp, DataHoraTriagem, Prioridade, 
                           Temperatura, PressaoSistolica, PressaoDiastolica, 
                           Observacoes, NumFuncTriagem)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (cod, nomehosp, datahoratriagem, prioridade, temperatura, 
          pressaosistolica, pressaodiastolica, observacoes, numfunctriagem))