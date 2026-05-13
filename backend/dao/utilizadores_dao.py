from backend.db import run_query


def select_all_utilizadores():
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        ORDER BY username ASC
    """)


def select_utilizador_by_idfunc(idfunc: int):
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        WHERE idfunc = %s
    """, (idfunc,))


def select_utilizador_by_username(username: str):
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        WHERE username = %s
    """, (username,))


def insert_utilizador(
    idfunc: int,
    username: str,
    password: str,
    bloqueado: bool = False,
    role: str = "",
):
    return run_query("""
        INSERT INTO utilizador (idfunc, username, password, bloqueado, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idfunc, username, password, bloqueado, role
    """, (
        idfunc,
        username,
        password,
        bloqueado,
        role,
    ))


def update_utilizador(
    idfunc: int,
    username=None,
    password=None,
    bloqueado=None,
    role=None,
):
    campos = []
    valores = []

    if username is not None:
        campos.append("username = %s")
        valores.append(username)

    if password is not None:
        campos.append("password = %s")
        valores.append(password)

    if bloqueado is not None:
        campos.append("bloqueado = %s")
        valores.append(bloqueado)

    if role is not None:
        campos.append("role = %s")
        valores.append(role)

    if len(campos) == 0:
        return select_utilizador_by_idfunc(idfunc)

    valores.append(idfunc)

    query = f"""
        UPDATE utilizador
        SET {', '.join(campos)}
        WHERE idfunc = %s
        RETURNING idfunc, username, password, bloqueado, role
    """
    return run_query(query, tuple(valores))


def delete_utilizador(idfunc: int):
    return run_query("""
        DELETE FROM utilizador
        WHERE idfunc = %s
        RETURNING idfunc
    """, (idfunc,))