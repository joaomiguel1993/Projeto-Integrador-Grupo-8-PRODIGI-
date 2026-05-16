from backend.db import run_query

_SELECT = """
    SELECT
        e.codepurgenc,
        e.numutent,
        e.idhosp,
        e.datahoraentr,
        e.datahoraatendimento,
        e.datahorasaida,
        e.estado,
        u.nome     AS nome_utente,
        u.datanasc AS data_nasc_utente,
        t.datahorainicio AS data_hora_triagem
    FROM epurgencia e
    LEFT JOIN utente  u ON u.numutent    = e.numutent
    LEFT JOIN triagem t ON t.codepurgenc = e.codepurgenc
"""


def select_all_episodios():
    return run_query(f"""
        {_SELECT}
        ORDER BY e.datahoraentr DESC
    """)


def select_episodio_by_id(codepurgenc: int):
    return run_query(f"""
        {_SELECT}
        WHERE e.codepurgenc = %s
    """, (codepurgenc,))


def select_episodios_by_utente(numutent: int):
    return run_query(f"""
        {_SELECT}
        WHERE e.numutent = %s
        ORDER BY e.datahoraentr DESC
    """, (numutent,))


def select_episodios_by_hospital(idhosp: int):
    return run_query(f"""
        {_SELECT}
        WHERE e.idhosp = %s
        ORDER BY e.datahoraentr DESC
    """, (idhosp,))


def select_episodios_sem_triagem(idhosp: int = None):
    if idhosp is not None:
        return run_query(f"""
            {_SELECT}
            WHERE e.estado = 'aberto'
              AND e.idhosp = %s
            ORDER BY e.datahoraentr ASC
        """, (idhosp,))

    return run_query(f"""
        {_SELECT}
        WHERE e.estado = 'aberto'
        ORDER BY e.datahoraentr ASC
    """)


def insert_episodio(numutent: int, idhosp: int, datahoraentr=None, estado: str = "aberto"):
    if datahoraentr is None:
        return run_query("""
            INSERT INTO epurgencia (numutent, idhosp, estado)
            VALUES (%s, %s, %s)
            RETURNING codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
        """, (numutent, idhosp, estado))

    return run_query("""
        INSERT INTO epurgencia (numutent, idhosp, datahoraentr, estado)
        VALUES (%s, %s, %s, %s)
        RETURNING codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
    """, (numutent, idhosp, datahoraentr, estado))


def update_episodio(codepurgenc: int, idhosp=None, datahoraatendimento=None, datahorasaida=None, estado=None):
    campos = []
    valores = []

    if idhosp is not None:
        campos.append("idhosp = %s")
        valores.append(idhosp)

    if datahoraatendimento is not None:
        campos.append("datahoraatendimento = %s")
        valores.append(datahoraatendimento)

    if datahorasaida is not None:
        campos.append("datahorasaida = %s")
        valores.append(datahorasaida)

    if estado is not None:
        campos.append("estado = %s")
        valores.append(estado)

    if len(campos) == 0:
        return select_episodio_by_id(codepurgenc)

    valores.append(codepurgenc)

    query = f"""
        UPDATE epurgencia
        SET {', '.join(campos)}
        WHERE codepurgenc = %s
        RETURNING codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
    """
    return run_query(query, tuple(valores))


def delete_episodio(codepurgenc: int):
    return run_query("""
        DELETE FROM epurgencia
        WHERE codepurgenc = %s
        RETURNING codepurgenc
    """, (codepurgenc,))