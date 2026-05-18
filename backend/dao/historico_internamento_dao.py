from backend.db import run_query


def select_all_historico_internamento():
    return run_query("""
        SELECT idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
        FROM historicointernamento
        ORDER BY datahora DESC, idhistorico DESC
    """)


def select_historico_internamento_by_id(id_historico: int):
    return run_query("""
        SELECT idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
        FROM historicointernamento
        WHERE idhistorico = %s
    """, (id_historico,))


def select_historico_by_internamento(cod_internamento: int):
    return run_query("""
        SELECT idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
        FROM historicointernamento
        WHERE codinternamento = %s
        ORDER BY datahora DESC, idhistorico DESC
    """, (cod_internamento,))


def select_historico_by_funcionario(id_func: int):
    return run_query("""
        SELECT idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
        FROM historicointernamento
        WHERE idfunc = %s
        ORDER BY datahora DESC, idhistorico DESC
    """, (id_func,))


def select_historico_by_tipo_evento(tipo_evento: str):
    return run_query("""
        SELECT idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
        FROM historicointernamento
        WHERE tipoevento = %s
        ORDER BY datahora DESC, idhistorico DESC
    """, (tipo_evento,))


def insert_historico_internamento(
    cod_internamento, data_hora=None, tipo_evento=None, descricao=None, id_func=None
):
    return run_query("""
        INSERT INTO historicointernamento (
            codinternamento, datahora, tipoevento, descricao, idfunc
        )
        VALUES (
            %s, COALESCE(%s, NOW()), %s, %s, %s
        )
        RETURNING idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
    """, (
        cod_internamento, data_hora, tipo_evento, descricao, id_func
    ))


def update_historico_internamento(id_historico: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_internamento": "codinternamento",
        "data_hora": "datahora",
        "tipo_evento": "tipoevento",
        "descricao": "descricao",
        "id_func": "idfunc",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_historico_internamento_by_id(id_historico)

    valores.append(id_historico)

    query = f"""
        UPDATE historicointernamento
        SET {', '.join(campos)}
        WHERE idhistorico = %s
        RETURNING idhistorico, codinternamento, datahora, tipoevento, descricao, idfunc
    """
    return run_query(query, tuple(valores))


def delete_historico_internamento(id_historico: int):
    return run_query("""
        DELETE FROM historicointernamento
        WHERE idhistorico = %s
        RETURNING idhistorico
    """, (id_historico,))