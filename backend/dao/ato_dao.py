from backend.db import run_query

def get_atos_episodio(cod: int, nomehosp: str):
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim, Tipo, NumFuncPresc, DataHoraPresc
        FROM Ato WHERE CodEpUrgenc = %s AND NomeHosp = %s
    """, (cod, nomehosp))
    return result if result else []

def insert_ato_basico(cod: int, nomehosp: str, datahorainicio: str, tipo: str):
    result = run_query("""
        INSERT INTO Ato (CodEpUrgenc, NomeHosp, DataHoraInicio, Tipo)
        VALUES (%s, %s, %s, %s)
    """, (cod, nomehosp, datahorainicio, tipo))
    return result

def insert_ato_com_prescricao(cod: int, nomehosp: str, datahorainicio: str, tipo: str, numfuncpresc: int, datahorapresc: str):
    result = run_query("""
        INSERT INTO Ato (CodEpUrgenc, NomeHosp, DataHoraInicio, Tipo, NumFuncPresc, DataHoraPresc)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (cod, nomehosp, datahorainicio, tipo, numfuncpresc, datahorapresc))
    return result

def get_atos_todos():
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim, Tipo, NumFuncPresc, DataHoraPresc
        FROM Ato ORDER BY DataHoraInicio DESC
    """)
    return result if result else []