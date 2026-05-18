from backend.db import run_query


def select_all_hospitais():
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone, totalcamas
        FROM hospital
        ORDER BY nome
    """)


def select_hospital_by_id(id_hosp: int):
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone, totalcamas
        FROM hospital
        WHERE idhosp = %s
    """, (id_hosp,))


def insert_hospital(nome: str, localizacao: str, email=None, telefone=None, total_camas=100):
    return run_query("""
        INSERT INTO hospital (nome, localizacao, email, telefone, totalcamas)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
    """, (nome, localizacao, email, telefone, total_camas))


def update_hospital(id_hosp: int, nome=None, localizacao=None, email=None, telefone=None, total_camas=None):
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
    if total_camas is not None:
        campos.append("totalcamas = %s")
        valores.append(total_camas)

    if not campos:
        return select_hospital_by_id(id_hosp)

    valores.append(id_hosp)

    query = f"""
        UPDATE hospital
        SET {', '.join(campos)}
        WHERE idhosp = %s
        RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
    """
    return run_query(query, tuple(valores))


def delete_hospital(id_hosp: int):
    return run_query("""
        DELETE FROM hospital
        WHERE idhosp = %s
        RETURNING idhosp
    """, (id_hosp,))