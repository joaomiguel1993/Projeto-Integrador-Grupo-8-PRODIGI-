from typing import Optional
from backend.db import run_query


def listar_atos():
    result = run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, DataHoraInicio, DataHoraFim, Descricao
        FROM Ato
        ORDER BY DataHoraInicio DESC
    """)
    return result if result else []


def obter_ato(id_ato: int):
    result = run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, DataHoraInicio, DataHoraFim, Descricao
        FROM Ato
        WHERE IdAto = %s
    """, (id_ato,))
    return result if result else []


def listar_atos_episodio(cod_epurgenc: int):
    result = run_query("""
        SELECT IdAto, CodEpUrgenc, Tipo, DataHoraInicio, DataHoraFim, Descricao
        FROM Ato
        WHERE CodEpUrgenc = %s
        ORDER BY DataHoraInicio DESC
    """, (cod_epurgenc,))
    return result if result else []


def criar_ato(cod_epurgenc: int, tipo: str, data_hora_inicio: str, descricao: Optional[str] = None):
    return run_query("""
        INSERT INTO Ato (CodEpUrgenc, Tipo, DataHoraInicio, Descricao)
        VALUES (%s, %s, %s, %s)
    """, (cod_epurgenc, tipo, data_hora_inicio, descricao))


def listar_funcionarios_ato(id_ato: int):
    result = run_query("""
        SELECT f.IdFunc, f.Nome, f.TipoFunc
        FROM RealizaAto ra
        JOIN Funcionario f ON ra.IdFunc = f.IdFunc
        WHERE ra.IdAto = %s
        ORDER BY f.Nome
    """, (id_ato,))
    return result if result else []


def listar_prescricoes_ato(id_ato: int):
    result = run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdAto = %s
        ORDER BY DataHoraPresc DESC
    """, (id_ato,))
    return result if result else []