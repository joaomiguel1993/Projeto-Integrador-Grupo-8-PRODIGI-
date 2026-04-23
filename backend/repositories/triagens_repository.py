from typing import Optional
from backend.db import run_query


def listar_triagens():
    result = run_query("""
        SELECT CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, Sintomas,
               Temperatura, FreqCardiaca, FreqRespiratoria, SpO2, Sistolica, Diastolica
        FROM Triagem
        ORDER BY DataHoraInicio DESC
    """)
    return result if result else []


def obter_triagem(cod_epurgenc: int):
    result = run_query("""
        SELECT CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, Sintomas,
               Temperatura, FreqCardiaca, FreqRespiratoria, SpO2, Sistolica, Diastolica
        FROM Triagem
        WHERE CodEpUrgenc = %s
    """, (cod_epurgenc,))
    return result if result else []


def criar_triagem(
    cod_epurgenc: int,
    cor_triagem: str,
    sintomas: str,
    data_hora_fim: Optional[str] = None,
    temperatura: Optional[float] = None,
    freq_cardiaca: Optional[int] = None,
    freq_respiratoria: Optional[int] = None,
    spo2: Optional[float] = None,
    sistolica: Optional[int] = None,
    diastolica: Optional[int] = None
):
    return run_query("""
        INSERT INTO Triagem (
            CodEpUrgenc, CorTriagem, Sintomas, DataHoraFim,
            Temperatura, FreqCardiaca, FreqRespiratoria, SpO2, Sistolica, Diastolica
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        cod_epurgenc, cor_triagem, sintomas, data_hora_fim,
        temperatura, freq_cardiaca, freq_respiratoria, spo2, sistolica, diastolica
    ))