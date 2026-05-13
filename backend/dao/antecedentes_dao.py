from typing import Optional
from backend.db import run_query


def select_all_antecedentes():
    return run_query("""
        SELECT codantecedente, nome, tipo
        FROM antecedente
        ORDER BY nome ASC
    """)


def select_antecedente_by_id(codantecedente: int):
    return run_query("""
        SELECT codantecedente, nome, tipo
        FROM antecedente
        WHERE codantecedente = %s
    """, (codantecedente,))


def insert_antecedente(nome: str, tipo: Optional[str] = None):
    if tipo is None:
        return run_query("""
            INSERT INTO antecedente (nome)
            VALUES (%s)
            RETURNING codantecedente, nome, tipo
        """, (nome,))

    return run_query("""
        INSERT INTO antecedente (nome, tipo)
        VALUES (%s, %s)
        RETURNING codantecedente, nome, tipo
    """, (nome, tipo))


def update_antecedente(codantecedente: int, nome=None, tipo=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if tipo is not None:
        campos.append("tipo = %s")
        valores.append(tipo)

    if len(campos) == 0:
        return select_antecedente_by_id(codantecedente)

    valores.append(codantecedente)

    query = f"""
        UPDATE antecedente
        SET {', '.join(campos)}
        WHERE codantecedente = %s
        RETURNING codantecedente, nome, tipo
    """
    return run_query(query, tuple(valores))


def delete_antecedente(codantecedente: int):
    return run_query("""
        DELETE FROM antecedente
        WHERE codantecedente = %s
        RETURNING codantecedente
    """, (codantecedente,))