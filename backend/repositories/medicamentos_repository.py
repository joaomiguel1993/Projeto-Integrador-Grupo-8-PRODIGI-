from backend.db import run_query


def listar_medicamentos():
    result = run_query("""
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        ORDER BY Nome
    """)
    return result if result else []


def obter_medicamento(cod_medicamento: int):
    result = run_query("""
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        WHERE CodMedicamento = %s
    """, (cod_medicamento,))
    return result if result else []


def listar_utentes_com_medicamento(cod_medicamento: int):
    result = run_query("""
        SELECT ma.NumUtent, u.Nome, ma.CodMedicacaoAtiva, ma.DataInicio, ma.DataFim, ma.Dosagem, ma.Ativo
        FROM MedicacaoAtiva ma
        JOIN Utente u ON ma.NumUtent = u.NumUtent
        WHERE ma.CodMedicamento = %s
        ORDER BY u.Nome
    """, (cod_medicamento,))
    return result if result else []