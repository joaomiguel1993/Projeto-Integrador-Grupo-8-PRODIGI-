from typing import Optional
from backend.db import run_query


def select_all_atos():
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        ORDER BY datahorainicio DESC
    """)


def select_ato_by_id(idato: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE idato = %s
    """, (idato,))


def select_atos_by_episodio(codepurgenc: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE codepurgenc = %s
        ORDER BY datahorainicio DESC
    """, (codepurgenc,))


def insert_ato(codepurgenc: int, tipo: str, descricao: Optional[str], datahorainicio, datahorafim=None):
    if descricao is None and datahorafim is None:
        return run_query("""
            INSERT INTO ato (codepurgenc, tipo, datahorainicio)
            VALUES (%s, %s, %s)
            RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        """, (codepurgenc, tipo, datahorainicio))

    if descricao is None:
        return run_query("""
            INSERT INTO ato (codepurgenc, tipo, datahorainicio, datahorafim)
            VALUES (%s, %s, %s, %s)
            RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        """, (codepurgenc, tipo, datahorainicio, datahorafim))

    if datahorafim is None:
        return run_query("""
            INSERT INTO ato (codepurgenc, tipo, descricao, datahorainicio)
            VALUES (%s, %s, %s, %s)
            RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        """, (codepurgenc, tipo, descricao, datahorainicio))

    return run_query("""
        INSERT INTO ato (codepurgenc, tipo, descricao, datahorainicio, datahorafim)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
    """, (codepurgenc, tipo, descricao, datahorainicio, datahorafim))


def update_ato(idato: int, tipo=None, descricao=None, datahorainicio=None, datahorafim=None):
    campos = []
    valores = []

    if tipo is not None:
        campos.append("tipo = %s")
        valores.append(tipo)

    if descricao is not None:
        campos.append("descricao = %s")
        valores.append(descricao)

    if datahorainicio is not None:
        campos.append("datahorainicio = %s")
        valores.append(datahorainicio)

    if datahorafim is not None:
        campos.append("datahorafim = %s")
        valores.append(datahorafim)

    if len(campos) == 0:
        return select_ato_by_id(idato)

    valores.append(idato)

    query = f"""
        UPDATE ato
        SET {', '.join(campos)}
        WHERE idato = %s
        RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
    """
    return run_query(query, tuple(valores))


def delete_ato(idato: int):
    return run_query("""
        DELETE FROM ato
        WHERE idato = %s
        RETURNING idato
    """, (idato,))