from backend.db import run_query
from typing import Optional


def select_all_antecedentes():
    return run_query("""
        SELECT codantecedente, nome, tipo
        FROM antecedente
        ORDER BY nome
    """)


def select_antecedente_by_id(cod_antecedente: int):
    return run_query("""
        SELECT codantecedente, nome, tipo
        FROM antecedente
        WHERE codantecedente = %s
    """, (cod_antecedente,))


def select_antecedente_by_tipo(tipo: str):
    return run_query("""
        SELECT codantecedente, nome, tipo
        FROM antecedente
        WHERE tipo = %s
        ORDER BY nome
    """, (tipo,))


def insert_antecedente(nome: str, tipo: Optional[str] = None):
    return run_query("""
        INSERT INTO antecedente (nome, tipo)
        VALUES (%s, %s)
        RETURNING codantecedente, nome, tipo
    """, (nome, tipo))


def update_antecedente(cod_antecedente: int, nome=None, tipo=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if tipo is not None:
        campos.append("tipo = %s")
        valores.append(tipo)

    if not campos:
        return select_antecedente_by_id(cod_antecedente)

    valores.append(cod_antecedente)

    query = f"""
        UPDATE antecedente
        SET {', '.join(campos)}
        WHERE codantecedente = %s
        RETURNING codantecedente, nome, tipo
    """
    return run_query(query, tuple(valores))


def delete_antecedente(cod_antecedente: int):
    return run_query("""
        DELETE FROM antecedente
        WHERE codantecedente = %s
        RETURNING codantecedente
    """, (cod_antecedente,))