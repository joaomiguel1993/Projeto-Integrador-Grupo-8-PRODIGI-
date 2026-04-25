from backend.db import run_query

def select_all_internamentos():
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        ORDER BY datahoraint DESC
    """)

def select_internamento_by_id(cod_internamento: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        WHERE codinternamento = %s
    """, (cod_internamento,))
