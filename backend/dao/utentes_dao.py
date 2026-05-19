from backend.db import run_query


def select_all_utentes():
    return run_query("""
        SELECT
            numutent AS num_utent,
            nome,
            nif,
            datanasc AS data_nasc,
            sexo,
            localidade,
            telefone,
            email
        FROM utente
        ORDER BY nome ASC
    """)


def select_utente_by_id(numutent: int):
    return run_query("""
        SELECT numutent AS num_utent, nome, nif, datanasc AS data_nasc, sexo, localidade, telefone, email
        FROM utente
        WHERE numutent = %s
    """, (numutent,))


def select_utente_by_nif(nif: str):
    return run_query("""
        SELECT
            numutent AS num_utent,
            nome,
            nif,
            datanasc AS data_nasc,
            sexo,
            localidade,
            telefone,
            email
        FROM utente
        WHERE nif = %s
    """, (nif,))


def insert_utente(
    nome: str,
    nif: str,
    datanasc,
    sexo: str,
    localidade=None,
    telefone=None,
    email=None,
):
    return run_query("""
        INSERT INTO utente (nome, nif, datanasc, sexo, localidade, telefone, email)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING numutent AS num_utent, nome, nif, datanasc AS data_nasc, sexo, localidade, telefone, email
    """, (
        nome,
        nif,
        datanasc,
        sexo,
        localidade,
        telefone,
        email,
    ))


def update_utente(
    numutent: int,
    nome=None,
    nif=None,
    datanasc=None,
    sexo=None,
    localidade=None,
    telefone=None,
    email=None,
):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if nif is not None:
        campos.append("nif = %s")
        valores.append(nif)

    if datanasc is not None:
        campos.append("datanasc = %s")
        valores.append(datanasc)

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

    if len(campos) == 0:
        return select_utente_by_id(numutent)

    valores.append(numutent)

    query = f"""
        UPDATE utente
        SET {', '.join(campos)}
        WHERE numutent = %s
        RETURNING numutent AS num_utent,  nome, nif, datanasc AS data_nasc, sexo, localidade, telefone, email
    """
    return run_query(query, tuple(valores))


def delete_utente(numutent: int):
    return run_query("""
        DELETE FROM utente
        WHERE numutent = %s
        RETURNING numutent
    """, (numutent,))