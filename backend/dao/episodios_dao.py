from typing import Optional
from backend.db import run_query


def select_all_episodios():
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
        FROM epurgencia
        ORDER BY datahoraentr DESC
    """)


def select_episodio_by_id(codepurgenc: int):
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
        FROM epurgencia
        WHERE codepurgenc = %s
    """, (codepurgenc,))


def select_episodios_by_utente(numutent: int):
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
        FROM epurgencia
        WHERE numutent = %s
        ORDER BY datahoraentr DESC
    """, (numutent,))


def select_episodios_by_hospital(idhosp: int):
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahoraatendimento, datahorasaida, estado
        FROM epurgencia
        WHERE idhosp = %s
        ORDER BY datahoraentr DESC
    """, (idhosp,))


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