from backend.db import run_query


def select_all_medicacao_ativa():
    return run_query("""
        SELECT codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        ORDER BY datainicio DESC, codmedicacaoativa DESC
    """)


def select_medicacao_ativa_by_id(cod_medicacao_ativa: int):
    return run_query("""
        SELECT codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        WHERE codmedicacaoativa = %s
    """, (cod_medicacao_ativa,))


def select_medicacao_ativa_by_nif(nif: str):
    return run_query("""
        SELECT codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        WHERE nif = %s
        ORDER BY datainicio DESC, codmedicacaoativa DESC
    """, (nif,))


def select_medicacao_ativa_by_medicamento(cod_medicamento: int):
    return run_query("""
        SELECT codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        WHERE codmedicamento = %s
        ORDER BY datainicio DESC, codmedicacaoativa DESC
    """, (cod_medicamento,))


def insert_medicacao_ativa(nif, cod_medicamento, data_inicio, data_fim=None, dosagem=None):
    return run_query("""
        INSERT INTO medicacaoativa (
            nif, codmedicamento, datainicio, datafim, dosagem
        )
        VALUES (%s, %s, %s, %s, %s)
        RETURNING codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
    """, (nif, cod_medicamento, data_inicio, data_fim, dosagem))


def update_medicacao_ativa(cod_medicacao_ativa: int, **data):
    campos = []
    valores = []

    mapping = {
        "nif": "nif",
        "cod_medicamento": "codmedicamento",
        "data_inicio": "datainicio",
        "data_fim": "datafim",
        "dosagem": "dosagem",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_medicacao_ativa_by_id(cod_medicacao_ativa)

    valores.append(cod_medicacao_ativa)

    query = f"""
        UPDATE medicacaoativa
        SET {', '.join(campos)}
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa, nif, codmedicamento, datainicio, datafim, dosagem
    """
    return run_query(query, tuple(valores))


def delete_medicacao_ativa(cod_medicacao_ativa: int):
    return run_query("""
        DELETE FROM medicacaoativa
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa
    """, (cod_medicacao_ativa,))