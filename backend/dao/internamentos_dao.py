from backend.db import run_query

def select_all_internamentos():
    return run_query("""
        SELECT CodInternamento, CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta,
               DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta
        FROM Internamento
        ORDER BY DataHoraInt DESC
    """)

def select_internamento_by_id(cod_internamento: int):
    return run_query("""
        SELECT CodInternamento, CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta,
               DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta
        FROM Internamento
        WHERE CodInternamento = %s
    """, (cod_internamento,))