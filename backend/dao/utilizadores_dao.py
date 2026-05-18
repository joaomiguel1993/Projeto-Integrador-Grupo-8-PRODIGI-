from backend.db import run_query


def select_all_utilizadores():
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        ORDER BY idfunc
    """)


def select_utilizador_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        WHERE idfunc = %s
    """, (id_func,))


def select_utilizador_by_username(username: str):
    return run_query("""
        SELECT idfunc, username, password, bloqueado, role
        FROM utilizador
        WHERE username = %s
    """, (username,))


def insert_utilizador(id_func: int, username: str, password: str, bloqueado: bool = False, role: str = ""):
    return run_query("""
        INSERT INTO utilizador (idfunc, username, password, bloqueado, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING idfunc, username, password, bloqueado, role
    """, (id_func, username, password, bloqueado, role))


def update_utilizador(id_func: int, username=None, password=None, bloqueado=None, role=None):
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

    if not campos:
        return select_utilizador_by_id(id_func)

    valores.append(id_func)

    query = f"""
        UPDATE utilizador
        SET {', '.join(campos)}
        WHERE idfunc = %s
        RETURNING idfunc, username, password, bloqueado, role
    """
    return run_query(query, tuple(valores))


def delete_utilizador(id_func: int):
    return run_query("""
        DELETE FROM utilizador
        WHERE idfunc = %s
        RETURNING idfunc
    """, (id_func,))