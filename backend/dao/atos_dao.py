from typing import Optional
from backend.db import run_query

def select_all_atos():
    return run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, Descricao, DataHoraInicio, DataHoraFim
        FROM Ato
        ORDER BY DataHoraInicio DESC
    """)

def select_ato_by_id(id_ato: int):
    return run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, Descricao, DataHoraInicio, DataHoraFim
        FROM Ato
        WHERE IdAto = %s
    """, (id_ato,))

def select_atos_by_ep_urgencia(cod_ep_urgenc: int):
    return run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, Descricao, DataHoraInicio, DataHoraFim
        FROM Ato
        WHERE CodEpUrgenc = %s
        ORDER BY DataHoraInicio DESC
    """, (cod_ep_urgenc,))

def insert_ato(cod_ep_urgenc: int, tipo: str, descricao: Optional[str], data_hora_inicio):
    return run_query("""
        INSERT INTO Ato (CodEpUrgenc, Tipo, Descricao, DataHoraInicio)
        VALUES (%s, %s, %s, %s)
        RETURNING IdAto, CodEpUrgenc, Tipo, Descricao, DataHoraInicio, DataHoraFim
    """, (cod_ep_urgenc, tipo, descricao, data_hora_inicio))

def select_funcionarios_by_ato(id_ato: int):
    return run_query("""
        SELECT f.IdFunc, f.Nome, f.TipoFunc
        FROM Realiza r
        JOIN Funcionario f ON r.IdFunc = f.IdFunc
        WHERE r.IdAto = %s
        ORDER BY f.Nome
    """, (id_ato,))

def select_prescricoes_by_ato(id_ato: int):
    return run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdAto = %s
        ORDER BY DataHoraPresc DESC
    """, (id_ato,))