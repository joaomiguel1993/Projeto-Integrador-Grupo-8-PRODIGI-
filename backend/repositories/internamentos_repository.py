from typing import Optional
from backend.db import run_query


def listar_internamentos():
    result = run_query("""
        SELECT CodInternamento, CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta,
               DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta
        FROM Internamento
        ORDER BY DataHoraInt DESC
    """)
    return result if result else []


def obter_internamento(cod_internamento: int):
    result = run_query("""
        SELECT CodInternamento, CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta,
               DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta
        FROM Internamento
        WHERE CodInternamento = %s
    """, (cod_internamento,))
    return result if result else []


def criar_internamento(
    cod_epurgenc: int,
    id_func: int,
    motivo_int: str,
    data_hora_consulta: Optional[str] = None,
    data_hora_alta: Optional[str] = None,
    numero_cama: Optional[str] = None,
    servico: Optional[str] = None,
    tipo_alta: Optional[str] = None
):
    return run_query("""
        INSERT INTO Internamento (
            CodEpUrgenc, IdFunc, MotivoInt, DataHoraConsulta,
            DataHoraAlta, NumeroCama, Servico, TipoAlta
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        cod_epurgenc, id_func, motivo_int, data_hora_consulta,
        data_hora_alta, numero_cama, servico, tipo_alta
    ))