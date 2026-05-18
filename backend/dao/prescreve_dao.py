from backend.db import run_query


def select_all_prescricoes():
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
               duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
               validadoporia, datahoravalidacaoia
        FROM prescreve
        ORDER BY datahorapresc DESC, idprescricao DESC
    """)


def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
               duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
               validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE idprescricao = %s
    """, (id_prescricao,))


def select_prescricoes_by_ato(id_ato: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
               duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
               validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE idato = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (id_ato,))


def select_prescricoes_by_medicamento(cod_medicamento: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
               duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
               validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE codmedicamento = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (cod_medicamento,))


def select_prescricoes_by_estado(estado_prescricao: str):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
               duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
               validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE estadoprescricao = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (estado_prescricao,))


def insert_prescricao(
    id_ato, cod_medicamento, dosagem, frequencia=None, via_administracao=None,
    duracao_dias=None, observacoes=None, data_hora_presc=None, estado_prescricao="pendente",
    score_risco_ia=None, validado_por_ia=False, data_hora_validacao_ia=None
):
    return run_query("""
        INSERT INTO prescreve (
            idato, codmedicamento, dosagem, frequencia, viaadministracao, duracaodias,
            observacoes, datahorapresc, estadoprescricao, scoreriscoia, validadoporia,
            datahoravalidacaoia
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s, %s
        )
        RETURNING idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
                  duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
                  validadoporia, datahoravalidacaoia
    """, (
        id_ato, cod_medicamento, dosagem, frequencia, via_administracao, duracao_dias,
        observacoes, data_hora_presc, estado_prescricao, score_risco_ia, validado_por_ia,
        data_hora_validacao_ia
    ))


def update_prescricao(id_prescricao: int, **data):
    campos = []
    valores = []

    mapping = {
        "id_ato": "idato",
        "cod_medicamento": "codmedicamento",
        "dosagem": "dosagem",
        "frequencia": "frequencia",
        "via_administracao": "viaadministracao",
        "duracao_dias": "duracaodias",
        "observacoes": "observacoes",
        "data_hora_presc": "datahorapresc",
        "estado_prescricao": "estadoprescricao",
        "score_risco_ia": "scoreriscoia",
        "validado_por_ia": "validadoporia",
        "data_hora_validacao_ia": "datahoravalidacaoia",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_prescricao_by_id(id_prescricao)

    valores.append(id_prescricao)

    query = f"""
        UPDATE prescreve
        SET {', '.join(campos)}
        WHERE idprescricao = %s
        RETURNING idprescricao, idato, codmedicamento, dosagem, frequencia, viaadministracao,
                  duracaodias, observacoes, datahorapresc, estadoprescricao, scoreriscoia,
                  validadoporia, datahoravalidacaoia
    """
    return run_query(query, tuple(valores))


def delete_prescricao(id_prescricao: int):
    return run_query("""
        DELETE FROM prescreve
        WHERE idprescricao = %s
        RETURNING idprescricao
    """, (id_prescricao,))