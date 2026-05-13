from typing import Optional
from backend.db import run_query


def select_all_internamentos():
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        ORDER BY datahoraint DESC
    """)


def select_internamento_by_id(codinternamento: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        WHERE codinternamento = %s
    """, (codinternamento,))


def select_internamento_by_episodio(codepurgenc: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        WHERE codepurgenc = %s
    """, (codepurgenc,))


def insert_internamento(
    codepurgenc: int,
    datahoraint,
    motivoint: str,
    idfunc: Optional[int] = None,
    datahoraconsulta=None,
    datahoraalta=None,
    numerocama: Optional[str] = None,
    servico: Optional[str] = None,
    tipoalta: Optional[str] = None,
):
    return run_query("""
        INSERT INTO internamento (
            codepurgenc, idfunc, datahoraint, datahoraconsulta,
            datahoraalta, motivoint, numerocama, servico, tipoalta
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                  datahoraalta, motivoint, numerocama, servico, tipoalta
    """, (
        codepurgenc,
        idfunc,
        datahoraint,
        datahoraconsulta,
        datahoraalta,
        motivoint,
        numerocama,
        servico,
        tipoalta,
    ))


def update_internamento(
    codinternamento: int,
    idfunc=None,
    datahoraconsulta=None,
    datahoraalta=None,
    motivoint=None,
    numerocama=None,
    servico=None,
    tipoalta=None,
):
    campos = []
    valores = []

    if idfunc is not None:
        campos.append("idfunc = %s")
        valores.append(idfunc)

    if datahoraconsulta is not None:
        campos.append("datahoraconsulta = %s")
        valores.append(datahoraconsulta)

    if datahoraalta is not None:
        campos.append("datahoraalta = %s")
        valores.append(datahoraalta)

    if motivoint is not None:
        campos.append("motivoint = %s")
        valores.append(motivoint)

    if numerocama is not None:
        campos.append("numerocama = %s")
        valores.append(numerocama)

    if servico is not None:
        campos.append("servico = %s")
        valores.append(servico)

    if tipoalta is not None:
        campos.append("tipoalta = %s")
        valores.append(tipoalta)

    if len(campos) == 0:
        return select_internamento_by_id(codinternamento)

    valores.append(codinternamento)

    query = f"""
        UPDATE internamento
        SET {', '.join(campos)}
        WHERE codinternamento = %s
        RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                  datahoraalta, motivoint, numerocama, servico, tipoalta
    """
    return run_query(query, tuple(valores))


def delete_internamento(codinternamento: int):
    return run_query("""
        DELETE FROM internamento
        WHERE codinternamento = %s
        RETURNING codinternamento
    """, (codinternamento,))