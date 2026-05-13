from typing import Optional
from backend.db import run_query


def select_all_hospitais():
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone, totalcamas
        FROM hospital
        ORDER BY nome ASC
    """)


def select_hospital_by_id(idhosp: int):
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone, totalcamas
        FROM hospital
        WHERE idhosp = %s
    """, (idhosp,))


def insert_hospital(nome: str, localizacao: str, email: Optional[str] = None, telefone: Optional[str] = None, totalcamas: Optional[int] = None):
    if email is None and telefone is None and totalcamas is None:
        return run_query("""
            INSERT INTO hospital (nome, localizacao)
            VALUES (%s, %s)
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao))

    if totalcamas is None:
        return run_query("""
            INSERT INTO hospital (nome, localizacao, email, telefone)
            VALUES (%s, %s, %s, %s)
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao, email, telefone))

    return run_query("""
        INSERT INTO hospital (nome, localizacao, email, telefone, totalcamas)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
    """, (nome, localizacao, email, telefone, totalcamas))


def update_hospital(idhosp: int, nome=None, localizacao=None, email=None, telefone=None, totalcamas=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if localizacao is not None:
        campos.append("localizacao = %s")
        valores.append(localizacao)

    if email is not None:
        campos.append("email = %s")
        valores.append(email)

    if telefone is not None:
        campos.append("telefone = %s")
        valores.append(telefone)

    if totalcamas is not None:
        campos.append("totalcamas = %s")
        valores.append(totalcamas)

    if len(campos) == 0:
        return select_hospital_by_id(idhosp)

    valores.append(idhosp)

    query = f"""
        UPDATE hospital
        SET {', '.join(campos)}
        WHERE idhosp = %s
        RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
    """
    return run_query(query, tuple(valores))


def delete_hospital(idhosp: int):
    return run_query("""
        DELETE FROM hospital
        WHERE idhosp = %s
        RETURNING idhosp
    """, (idhosp,))