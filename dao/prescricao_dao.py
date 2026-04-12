from backend.db import run_query

def get_prescricoes():
    result = run_query("""
        SELECT CodPrescricao, CodEpUrgenc, NomeHosp, NumFuncPresc, DataHoraPresc,
               Medicamento, Dose, Frequencia, Duracao
        FROM Prescreve
        ORDER BY DataHoraPresc DESC
    """)
    return result if result else []

def get_prescricoes_episodio(cod: int, nomehosp: str):
    result = run_query("""
        SELECT CodPrescricao, CodEpUrgenc, NomeHosp, NumFuncPresc, DataHoraPresc,
               Medicamento, Dose, Frequencia, Duracao
        FROM Prescreve
        WHERE CodEpUrgenc = %s AND NomeHosp = %s
        ORDER BY DataHoraPresc DESC
    """, (cod, nomehosp))
    return result if result else []

def insert_prescricao(cod: int, nomehosp: str, numfuncpresc: int, datahorapresc: str,
                      medicamento: str, dose: str, frequencia: str, duracao: str):
    result = run_query("""
        INSERT INTO Prescreve
        (CodEpUrgenc, NomeHosp, NumFuncPresc, DataHoraPresc, Medicamento, Dose, Frequencia, Duracao)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (cod, nomehosp, numfuncpresc, datahorapresc, medicamento, dose, frequencia, duracao))
    return result