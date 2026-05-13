from backend.db import run_query


def select_all_alertas():
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor
        FROM alerta
        ORDER BY codalerta ASC
    """)


def select_alerta_by_id(cod_alerta: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor
        FROM alerta
        WHERE codalerta = %s
    """, (cod_alerta,))


def select_alertas_by_prescricao(id_prescricao: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor
        FROM alerta
        WHERE idprescricao = %s
        ORDER BY codalerta ASC
    """, (id_prescricao,))


def insert_alerta(
    id_prescricao: int,
    id_func,
    tipo: str,
    justificacao=None,
    severidade: str = "moderado",
    score_risco=None,
):
    return run_query("""
        INSERT INTO alerta (
            idprescricao, idfunc, tipo, justificacao, severidade, scorerisco
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
                  severidade, scorerisco, resolvido, resolvidoem, resolvidopor
    """, (
        id_prescricao,
        id_func,
        tipo,
        justificacao,
        severidade,
        score_risco,
    ))


def update_alerta(
    cod_alerta: int,
    id_func=None,
    tipo=None,
    ignorado=None,
    justificacao=None,
    severidade=None,
    score_risco=None,
    resolvido=None,
    resolvido_em=None,
    resolvido_por=None,
):
    campos = []
    valores = []

    if id_func is not None:
        campos.append("idfunc = %s")
        valores.append(id_func)

    if tipo is not None:
        campos.append("tipo = %s")
        valores.append(tipo)

    if ignorado is not None:
        campos.append("ignorado = %s")
        valores.append(ignorado)

    if justificacao is not None:
        campos.append("justificacao = %s")
        valores.append(justificacao)

    if severidade is not None:
        campos.append("severidade = %s")
        valores.append(severidade)

    if score_risco is not None:
        campos.append("scorerisco = %s")
        valores.append(score_risco)

    if resolvido is not None:
        campos.append("resolvido = %s")
        valores.append(resolvido)

    if resolvido_em is not None:
        campos.append("resolvidoem = %s")
        valores.append(resolvido_em)

    if resolvido_por is not None:
        campos.append("resolvidopor = %s")
        valores.append(resolvido_por)

    if len(campos) == 0:
        return select_alerta_by_id(cod_alerta)

    valores.append(cod_alerta)

    query = f"""
        UPDATE alerta
        SET {', '.join(campos)}
        WHERE codalerta = %s
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
                  severidade, scorerisco, resolvido, resolvidoem, resolvidopor
    """
    return run_query(query, tuple(valores))


def resolver_alerta(cod_alerta: int, resolvido_por: int):
    return run_query("""
        UPDATE alerta
        SET resolvido = TRUE,
            resolvidoem = NOW(),
            resolvidopor = %s,
            ignorado = FALSE
        WHERE codalerta = %s
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
                  severidade, scorerisco, resolvido, resolvidoem, resolvidopor
    """, (resolvido_por, cod_alerta))


def delete_alerta(cod_alerta: int):
    return run_query("""
        DELETE FROM alerta
        WHERE codalerta = %s
        RETURNING codalerta
    """, (cod_alerta,))