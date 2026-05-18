from backend.dao import utilizadores_dao
from backend.auth.security import hash_password


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["idfunc"],
        "username": row["username"],
        "bloqueado": row["bloqueado"],
        "role": row["role"],
    }


def get_all():
    rows = utilizadores_dao.select_all_utilizadores()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_func: int):
    rows = utilizadores_dao.select_utilizador_by_id(id_func)
    return _map_row(_first_or_none(rows))


def get_by_username(username: str):
    rows = utilizadores_dao.select_utilizador_by_username(username)
    return _map_row(_first_or_none(rows))


def create(data: dict):
    password_hashed = hash_password(data["password"])
    rows = utilizadores_dao.insert_utilizador(
        data["id_func"],
        data["username"],
        password_hashed,
        data.get("bloqueado", False),
        data.get("role", ""),
    )
    return _map_row(_first_or_none(rows))


def update(id_func: int, data: dict):
    if "password" in data and data["password"] is not None:
        data["password"] = hash_password(data["password"])

    rows = utilizadores_dao.update_utilizador(
        id_func,
        data.get("username"),
        data.get("password"),
        data.get("bloqueado"),
        data.get("role"),
    )
    return _map_row(_first_or_none(rows))


def delete(id_func: int):
    rows = utilizadores_dao.delete_utilizador(id_func)
    row = _first_or_none(rows)
    return row["idfunc"] if row else None