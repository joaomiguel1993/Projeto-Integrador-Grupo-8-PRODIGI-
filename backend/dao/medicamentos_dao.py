from backend.db import run_query

def select_all_medicamentos():
    return run_query("""
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        ORDER BY Nome
    """)

def select_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        WHERE CodMedicamento = %s
    """, (cod_medicamento,))