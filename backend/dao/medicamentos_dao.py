from backend.db import run_query

def select_all_medicamentos():
    return run_query("""
        SELECT codmedicamento, nome, principioativo
        FROM medicamento
        ORDER BY nome
    """)

def select_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT codmedicamento, nome, principioativo
        FROM medicamento
        WHERE codmedicamento = %s
    """, (cod_medicamento,))
