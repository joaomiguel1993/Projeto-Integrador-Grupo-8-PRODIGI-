from backend.db import run_query


def select_all_atos():
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        ORDER BY datahorainicio DESC, idato DESC
    """)


def select_ato_by_id(id_ato: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE idato = %s
    """, (id_ato,))


def select_atos_by_cod_ep_urgenc(cod_ep_urgenc: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE codepurgenc = %s
        ORDER BY datahorainicio DESC, idato DESC
    """, (cod_ep_urgenc,))


def insert_ato(cod_ep_urgenc: int, tipo: str, descricao=None, data_hora_inicio=None, data_hora_fim=None):
    return run_query("""
        INSERT INTO ato (codepurgenc, tipo, descricao, datahorainicio, datahorafim)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
    """, (cod_ep_urgenc, tipo, descricao, data_hora_inicio, data_hora_fim))


def update_ato(id_ato: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_ep_urgenc": "codepurgenc",
        "tipo": "tipo",
        "descricao": "descricao",
        "data_hora_inicio": "datahorainicio",
        "data_hora_fim": "datahorafim",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_ato_by_id(id_ato)

    valores.append(id_ato)

    query = f"""
        UPDATE ato
        SET {', '.join(campos)}
        WHERE idato = %s
        RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
    """
    return run_query(query, tuple(valores))


def delete_ato(id_ato: int):
    return run_query("""
        DELETE FROM ato
        WHERE idato = %s
        RETURNING idato
    """, (id_ato,))