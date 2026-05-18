from backend.db import run_query


def select_all_internamentos():
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
               estadoatual, observacoesalta, diagnosticoalta, tipoalta
        FROM internamento
        ORDER BY datahoraint DESC, codinternamento DESC
    """)


def select_internamento_by_id(cod_internamento: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
               estadoatual, observacoesalta, diagnosticoalta, tipoalta
        FROM internamento
        WHERE codinternamento = %s
    """, (cod_internamento,))


def select_internamento_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
               estadoatual, observacoesalta, diagnosticoalta, tipoalta
        FROM internamento
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))


def select_internamentos_by_funcionario(id_func: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
               estadoatual, observacoesalta, diagnosticoalta, tipoalta
        FROM internamento
        WHERE idfunc = %s
        ORDER BY datahoraint DESC, codinternamento DESC
    """, (id_func,))


def select_internamentos_by_estado(estado_atual: str):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
               estadoatual, observacoesalta, diagnosticoalta, tipoalta
        FROM internamento
        WHERE estadoatual = %s
        ORDER BY datahoraint DESC, codinternamento DESC
    """, (estado_atual,))


def insert_internamento(
    cod_ep_urgenc, id_func=None, data_hora_int=None, data_hora_consulta=None,
    data_hora_alta=None, motivo_int=None, numero_cama=None, servico=None,
    prioridade_internamento=None, estado_atual="ativo", observacoes_alta=None,
    diagnostico_alta=None, tipo_alta=None
):
    return run_query("""
        INSERT INTO internamento (
            codepurgenc, idfunc, datahoraint, datahoraconsulta, datahoraalta,
            motivoint, numerocama, servico, prioridadeinternamento, estadoatual,
            observacoesalta, diagnosticoalta, tipoalta
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                  datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
                  estadoatual, observacoesalta, diagnosticoalta, tipoalta
    """, (
        cod_ep_urgenc, id_func, data_hora_int, data_hora_consulta, data_hora_alta,
        motivo_int, numero_cama, servico, prioridade_internamento, estado_atual,
        observacoes_alta, diagnostico_alta, tipo_alta
    ))


def update_internamento(cod_internamento: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_ep_urgenc": "codepurgenc",
        "id_func": "idfunc",
        "data_hora_int": "datahoraint",
        "data_hora_consulta": "datahoraconsulta",
        "data_hora_alta": "datahoraalta",
        "motivo_int": "motivoint",
        "numero_cama": "numerocama",
        "servico": "servico",
        "prioridade_internamento": "prioridadeinternamento",
        "estado_atual": "estadoatual",
        "observacoes_alta": "observacoesalta",
        "diagnostico_alta": "diagnosticoalta",
        "tipo_alta": "tipoalta",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_internamento_by_id(cod_internamento)

    valores.append(cod_internamento)

    query = f"""
        UPDATE internamento
        SET {', '.join(campos)}
        WHERE codinternamento = %s
        RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                  datahoraalta, motivoint, numerocama, servico, prioridadeinternamento,
                  estadoatual, observacoesalta, diagnosticoalta, tipoalta
    """
    return run_query(query, tuple(valores))


def delete_internamento(cod_internamento: int):
    return run_query("""
        DELETE FROM internamento
        WHERE codinternamento = %s
        RETURNING codinternamento
    """, (cod_internamento,))