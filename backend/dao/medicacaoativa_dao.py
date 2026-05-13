from typing import Optional
from backend.db import run_query


def select_all_medicacoes_ativas():
    return run_query("""
        SELECT codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        ORDER BY datainicio DESC
    """)


def select_medicacao_ativa_by_id(codmedicacaoativa: int):
    return run_query("""
        SELECT codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        WHERE codmedicacaoativa = %s
    """, (codmedicacaoativa,))


def select_medicacoes_ativas_by_utente(numutent: int):
    return run_query("""
        SELECT codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        WHERE numutent = %s
        ORDER BY datainicio DESC
    """, (numutent,))


def insert_medicacao_ativa(
    numutent: int,
    codmedicamento: int,
    datainicio,
    datafim=None,
    dosagem: Optional[str] = None,
):
    return run_query("""
        INSERT INTO medicacaoativa (numutent, codmedicamento, datainicio, datafim, dosagem)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
    """, (
        numutent,
        codmedicamento,
        datainicio,
        datafim,
        dosagem,
    ))


def update_medicacao_ativa(codmedicacaoativa: int, datafim=None, dosagem=None):
    campos = []
    valores = []

    if datafim is not None:
        campos.append("datafim = %s")
        valores.append(datafim)

    if dosagem is not None:
        campos.append("dosagem = %s")
        valores.append(dosagem)

    if len(campos) == 0:
        return select_medicacao_ativa_by_id(codmedicacaoativa)

    valores.append(codmedicacaoativa)

    query = f"""
        UPDATE medicacaoativa
        SET {', '.join(campos)}
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
    """
    return run_query(query, tuple(valores))


def delete_medicacao_ativa(codmedicacaoativa: int):
    return run_query("""
        DELETE FROM medicacaoativa
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa
    """, (codmedicacaoativa,))