from backend.db import run_query


def listar_prescricoes():
    result = run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        ORDER BY DataHoraPresc DESC
    """)
    return result if result else []


def obter_prescricao(id_prescricao: int):
    result = run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdPrescricao = %s
    """, (id_prescricao,))
    return result if result else []


def listar_prescricoes_ato(id_ato: int):
    result = run_query("""
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdAto = %s
        ORDER BY DataHoraPresc DESC
    """, (id_ato,))
    return result if result else []


def criar_prescricao(id_ato: int, descricao: str):
    return run_query("""
        INSERT INTO Prescreve (IdAto, Descricao)
        VALUES (%s, %s)
    """, (id_ato, descricao))


def listar_alertas_prescricao(id_prescricao: int):
    result = run_query("""
        SELECT IdPrescricao, CodAlerta, IdFunc, DataHorAlerta, Tipo, Ignorado, Justificacao
        FROM Alerta
        WHERE IdPrescricao = %s
        ORDER BY CodAlerta
    """, (id_prescricao,))
    return result if result else []