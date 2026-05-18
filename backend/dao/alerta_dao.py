from backend.db import run_query


def select_all_alertas():
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        ORDER BY datahoralerta DESC, codalerta DESC
    """)


def select_alerta_by_id(cod_alerta: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        WHERE codalerta = %s
    """, (cod_alerta,))


def select_alertas_by_prescricao(id_prescricao: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        WHERE idprescricao = %s
        ORDER BY datahoralerta DESC, codalerta DESC
    """, (id_prescricao,))


def select_alertas_by_funcionario(id_func: int):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        WHERE idfunc = %s
        ORDER BY datahoralerta DESC, codalerta DESC
    """, (id_func,))


def select_alertas_by_severidade(severidade: str):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        WHERE severidade = %s
        ORDER BY datahoralerta DESC, codalerta DESC
    """, (severidade,))


def select_alertas_resolvidos(resolvido: bool):
    return run_query("""
        SELECT codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
               severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        FROM alerta
        WHERE resolvido = %s
        ORDER BY datahoralerta DESC, codalerta DESC
    """, (resolvido,))


def insert_alerta(
    id_prescricao, id_func=None, tipo=None, data_hor_alerta=None, ignorado=False,
    justificacao=None, severidade="moderado", score_risco=None, resolvido=False,
    resolvido_em=None, resolvido_por=None, mensagem_ia=None, recomendacao=None
):
    return run_query("""
        INSERT INTO alerta (
            idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao, severidade,
            scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
        )
        VALUES (
            %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
                  severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
    """, (
        id_prescricao, id_func, tipo, data_hor_alerta, ignorado, justificacao, severidade,
        score_risco, resolvido, resolvido_em, resolvido_por, mensagem_ia, recomendacao
    ))


def update_alerta(cod_alerta: int, **data):
    campos = []
    valores = []

    mapping = {
        "id_prescricao": "idprescricao",
        "id_func": "idfunc",
        "tipo": "tipo",
        "data_hor_alerta": "datahoralerta",
        "ignorado": "ignorado",
        "justificacao": "justificacao",
        "severidade": "severidade",
        "score_risco": "scorerisco",
        "resolvido": "resolvido",
        "resolvido_em": "resolvidoem",
        "resolvido_por": "resolvidopor",
        "mensagem_ia": "mensagemia",
        "recomendacao": "recomendacao",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_alerta_by_id(cod_alerta)

    valores.append(cod_alerta)

    query = f"""
        UPDATE alerta
        SET {', '.join(campos)}
        WHERE codalerta = %s
        RETURNING codalerta, idprescricao, idfunc, tipo, datahoralerta, ignorado, justificacao,
                  severidade, scorerisco, resolvido, resolvidoem, resolvidopor, mensagemia, recomendacao
    """
    return run_query(query, tuple(valores))


def delete_alerta(cod_alerta: int):
    return run_query("""
        DELETE FROM alerta
        WHERE codalerta = %s
        RETURNING codalerta
    """, (cod_alerta,))