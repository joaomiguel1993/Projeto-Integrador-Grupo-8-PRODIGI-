from backend.db import run_query


def select_all_exames():
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        ORDER BY datahorapedido DESC, codexame DESC
    """)


def select_exame_by_id(cod_exame: int):
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        WHERE codexame = %s
    """, (cod_exame,))


def select_exames_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        WHERE codepurgenc = %s
        ORDER BY datahorapedido DESC, codexame DESC
    """, (cod_ep_urgenc,))


def select_exames_by_estado(estado: str):
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        WHERE estado = %s
        ORDER BY datahorapedido DESC, codexame DESC
    """, (estado,))


def select_exames_by_tipo(tipo: str):
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        WHERE tipo = %s
        ORDER BY datahorapedido DESC, codexame DESC
    """, (tipo,))


def select_exames_by_funcionario(id_func: int):
    return run_query("""
        SELECT codexame, codepurgenc, tipo, resultado, datahorapedido,
               datahoraresultado, estado, idfunc
        FROM exame
        WHERE idfunc = %s
        ORDER BY datahorapedido DESC, codexame DESC
    """, (id_func,))


def insert_exame(
    cod_ep_urgenc, tipo, resultado=None, data_hora_pedido=None,
    data_hora_resultado=None, estado="pendente", id_func=None
):
    return run_query("""
        INSERT INTO exame (
            codepurgenc, tipo, resultado, datahorapedido,
            datahoraresultado, estado, idfunc
        )
        VALUES (
            %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s
        )
        RETURNING codexame, codepurgenc, tipo, resultado, datahorapedido,
                  datahoraresultado, estado, idfunc
    """, (
        cod_ep_urgenc, tipo, resultado, data_hora_pedido,
        data_hora_resultado, estado, id_func
    ))


def update_exame(cod_exame: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_ep_urgenc": "codepurgenc",
        "tipo": "tipo",
        "resultado": "resultado",
        "data_hora_pedido": "datahorapedido",
        "data_hora_resultado": "datahoraresultado",
        "estado": "estado",
        "id_func": "idfunc",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_exame_by_id(cod_exame)

    valores.append(cod_exame)

    query = f"""
        UPDATE exame
        SET {', '.join(campos)}
        WHERE codexame = %s
        RETURNING codexame, codepurgenc, tipo, resultado, datahorapedido,
                  datahoraresultado, estado, idfunc
    """
    return run_query(query, tuple(valores))


def delete_exame(cod_exame: int):
    return run_query("""
        DELETE FROM exame
        WHERE codexame = %s
        RETURNING codexame
    """, (cod_exame,))