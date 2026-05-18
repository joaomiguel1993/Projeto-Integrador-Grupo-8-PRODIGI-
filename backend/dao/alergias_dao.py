from typing import Optional
from backend.db import run_query

def select_all_alergias(nif: str):
    return run_query("""
        SELECT codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        FROM alergia
        WHERE nif = %s
        ORDER BY dataregisto DESC, codalergia DESC
    """, (nif,))

def select_alergia_by_id(codalergia: int):
    return run_query("""
        SELECT codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        FROM alergia
        WHERE codalergia = %s
    """, (codalergia,))

def select_alergias_by_classe(classe_terapeutica: str):
    return run_query("""
        SELECT codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        FROM alergia
        WHERE classterapeutica = %s
        ORDER BY nivelgravidade, dataregisto DESC
    """, (classe_terapeutica,))

def select_alergias_stats():
    return run_query("""
        SELECT
            classterapeutica,
            nivelgravidade,
            COUNT(*) AS total,
            COUNT(DISTINCT nif) AS utentes_afetados
        FROM alergia
        GROUP BY classterapeutica, nivelgravidade
        ORDER BY classterapeutica, nivelgravidade
    """)

def insert_alergia(
    nif: str,
    substancia: str,
    classe_terapeutica: str,
    nivelgravidade: Optional[str] = None,
    reacao: Optional[str] = None,
):
    if nivelgravidade is None and reacao is None:
        return run_query("""
            INSERT INTO alergia (nif, substancia, classterapeutica)
            VALUES (%s, %s, %s)
            RETURNING codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        """, (nif, substancia, classe_terapeutica))

    if reacao is None:
        return run_query("""
            INSERT INTO alergia (nif, substancia, classterapeutica, nivelgravidade)
            VALUES (%s, %s, %s, %s)
            RETURNING codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        """, (nif, substancia, classe_terapeutica, nivelgravidade))

    if nivelgravidade is None:
        return run_query("""
            INSERT INTO alergia (nif, substancia, classterapeutica, reacao)
            VALUES (%s, %s, %s, %s)
            RETURNING codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
        """, (nif, substancia, classe_terapeutica, reacao))

    return run_query("""
        INSERT INTO alergia (nif, substancia, classterapeutica, nivelgravidade, reacao)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
    """, (nif, substancia, classe_terapeutica, nivelgravidade, reacao))

def update_alergia(
    codalergia: int,
    substancia: Optional[str] = None,
    classe_terapeutica: Optional[str] = None,
    nivelgravidade: Optional[str] = None,
    reacao: Optional[str] = None,
):
    campos = []
    valores = []

    if substancia is not None:
        campos.append("substancia = %s")
        valores.append(substancia)

    if classe_terapeutica is not None:
        campos.append("classterapeutica = %s")
        valores.append(classe_terapeutica)

    if nivelgravidade is not None:
        campos.append("nivelgravidade = %s")
        valores.append(nivelgravidade)

    if reacao is not None:
        campos.append("reacao = %s")
        valores.append(reacao)

    if not campos:
        return select_alergia_by_id(codalergia)

    valores.append(codalergia)

    query = f"""
        UPDATE alergia
        SET {', '.join(campos)}
        WHERE codalergia = %s
        RETURNING codalergia, nif, substancia, classterapeutica, nivelgravidade, reacao, dataregisto
    """
    return run_query(query, tuple(valores))

def delete_alergia(codalergia: int):
    return run_query("""
        DELETE FROM alergia
        WHERE codalergia = %s
        RETURNING codalergia
    """, (codalergia,))