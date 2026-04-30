from backend.db import run_query

def select_all_alertas():
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao
        FROM alerta
        ORDER BY datahoralerta DESC
    """)

def select_alerta_by_id(codalerta: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao
        FROM alerta
        WHERE codalerta = %s
    """, (codalerta,))

def select_alertas_by_prescricao(idprescricao: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao
        FROM alerta
        WHERE idprescricao = %s
        ORDER BY datahoralerta DESC
    """, (idprescricao,))

def insert_alerta(idprescricao: int, idfunc, tipo: str):
    return run_query("""
        INSERT INTO alerta (idprescricao, idfunc, tipo)
        VALUES (%s, %s, %s)
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao
    """, (idprescricao, idfunc, tipo))

def update_alerta_ignorado(codalerta: int, ignorado: bool, justificacao):
    return run_query("""
        UPDATE alerta
        SET ignorado = %s, justificacao = %s
        WHERE codalerta = %s
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao
    """, (ignorado, justificacao, codalerta))