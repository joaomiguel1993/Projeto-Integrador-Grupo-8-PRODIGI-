from backend.dao import utilizadores_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["id_func"],
        "username": row["username"],
        "password": row["password"],
        "bloqueado": row["bloqueado"],
        "role": row["role"],
    }


def listar_utilizadores():
    rows = utilizadores_dao.select_all_utilizadores()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_utilizador_por_id_func(id_func: int):
    rows = utilizadores_dao.select_utilizador_by_idfunc(id_func)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_utilizador_por_username(username: str):
    rows = utilizadores_dao.select_utilizador_by_username(username)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_utilizador(data: dict):
    rows = utilizadores_dao.insert_utilizador(
        data["id_func"],
        data["username"],
        data["password"],
        data.get("bloqueado", False),
        data.get("role", ""),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_utilizador(id_func: int, data: dict):
    rows = utilizadores_dao.update_utilizador(
        id_func,
        data.get("username"),
        data.get("password"),
        data.get("bloqueado"),
        data.get("role"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_utilizador(id_func: int):
    rows = utilizadores_dao.delete_utilizador(id_func)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["id_func"]