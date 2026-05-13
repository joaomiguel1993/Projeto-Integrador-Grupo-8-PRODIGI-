from backend.db import run_query


def select_all_prescricoes():
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
        FROM prescreve
        ORDER BY idprescricao ASC
    """)


def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE idprescricao = %s
    """, (id_prescricao,))


def select_prescricoes_by_ato(id_ato: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
        FROM prescreve
        WHERE idato = %s
        ORDER BY idprescricao ASC
    """, (id_ato,))


def insert_prescricao(
    id_ato: int,
    cod_medicamento: int,
    dosagem: str,
    observacoes=None,
):
    return run_query("""
        INSERT INTO prescreve (
            idato, codmedicamento, dosagem, observacoes
        )
        VALUES (%s, %s, %s, %s)
        RETURNING idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
                  estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
    """, (
        id_ato,
        cod_medicamento,
        dosagem,
        observacoes,
    ))


def update_prescricao(
    id_prescricao: int,
    id_ato=None,
    cod_medicamento=None,
    dosagem=None,
    observacoes=None,
    estado_prescricao=None,
    score_risco_ia=None,
    validado_por_ia=None,
    data_hora_validacao_ia=None,
):
    campos = []
    valores = []

    if id_ato is not None:
        campos.append("idato = %s")
        valores.append(id_ato)

    if cod_medicamento is not None:
        campos.append("codmedicamento = %s")
        valores.append(cod_medicamento)

    if dosagem is not None:
        campos.append("dosagem = %s")
        valores.append(dosagem)

    if observacoes is not None:
        campos.append("observacoes = %s")
        valores.append(observacoes)

    if estado_prescricao is not None:
        campos.append("estadoprescricao = %s")
        valores.append(estado_prescricao)

    if score_risco_ia is not None:
        campos.append("scoreriscoia = %s")
        valores.append(score_risco_ia)

    if validado_por_ia is not None:
        campos.append("validadoporia = %s")
        valores.append(validado_por_ia)

    if data_hora_validacao_ia is not None:
        campos.append("datahoravalidacaoia = %s")
        valores.append(data_hora_validacao_ia)

    if len(campos) == 0:
        return select_prescricao_by_id(id_prescricao)

    valores.append(id_prescricao)

    query = f"""
        UPDATE prescreve
        SET {', '.join(campos)}
        WHERE idprescricao = %s
        RETURNING idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
                  estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
    """
    return run_query(query, tuple(valores))


def update_prescricao_ia_status(
    id_prescricao: int,
    estado_prescricao: str,
    score_risco_ia: float,
    validado_por_ia: bool,
    data_hora_validacao_ia,
):
    return run_query("""
        UPDATE prescreve
        SET estadoprescricao = %s,
            scoreriscoia = %s,
            validadoporia = %s,
            datahoravalidacaoia = %s
        WHERE idprescricao = %s
        RETURNING idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc,
                  estadoprescricao, scoreriscoia, validadoporia, datahoravalidacaoia
    """, (
        estado_prescricao,
        score_risco_ia,
        validado_por_ia,
        data_hora_validacao_ia,
        id_prescricao,
    ))


def delete_prescricao(id_prescricao: int):
    return run_query("""
        DELETE FROM prescreve
        WHERE idprescricao = %s
        RETURNING idprescricao
    """, (id_prescricao,))