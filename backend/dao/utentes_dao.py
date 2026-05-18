from backend.db import run_query


def select_all_utente():
    return run_query("""
        SELECT nif, nome, data_nasc, sexo, localidade, telefone, email
        FROM utente
        ORDER BY nome
    """)


def select_utente_by_nif(nif: str):
    return run_query("""
        SELECT nif, nome, data_nasc, sexo, localidade, telefone, email
        FROM utente
        WHERE nif = %s
    """, (nif,))


def select_utente_by_email(email: str):
    return run_query("""
        SELECT nif, nome, data_nasc, sexo, localidade, telefone, email
        FROM utente
        WHERE email = %s
    """, (email,))


def insert_utente(nif: str, nome: str, data_nasc, sexo: str, localidade=None, telefone=None, email=None):
    return run_query("""
        INSERT INTO utente (nif, nome, data_nasc, sexo, localidade, telefone, email)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING nif, nome, data_nasc, sexo, localidade, telefone, email
    """, (nif, nome, data_nasc, sexo, localidade, telefone, email))


def update_utente(nif: str, nome=None, data_nasc=None, sexo=None, localidade=None, telefone=None, email=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)
    if data_nasc is not None:
        campos.append("data_nasc = %s")
        valores.append(data_nasc)
    if sexo is not None:
        campos.append("sexo = %s")
        valores.append(sexo)
    if localidade is not None:
        campos.append("localidade = %s")
        valores.append(localidade)
    if telefone is not None:
        campos.append("telefone = %s")
        valores.append(telefone)
    if email is not None:
        campos.append("email = %s")
        valores.append(email)

    if not campos:
        return select_utente_by_nif(nif)

    valores.append(nif)

    query = f"""
        UPDATE utente
        SET {', '.join(campos)}
        WHERE nif = %s
        RETURNING nif, nome, data_nasc, sexo, localidade, telefone, email
    """
    return run_query(query, tuple(valores))


def delete_utente(nif: str):
    return run_query("""
        DELETE FROM utente
        WHERE nif = %s
        RETURNING nif
    """, (nif,))