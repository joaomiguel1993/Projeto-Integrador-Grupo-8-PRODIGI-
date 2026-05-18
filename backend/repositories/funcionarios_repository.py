from backend.dao import funcionarios_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["idfunc"],
        "nome": row["nome"],
        "tipo_func": row["tipofunc"],
        "sexo": row["sexo"],
        "email": row["email"],
        "telefone": row["telefone"],
        "biografia": row["biografia"],
        "foto_url": row["foto_url"],
    }


def get_all():
    rows = funcionarios_dao.select_all_funcionarios()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_func: int):
    rows = funcionarios_dao.select_funcionario_by_id(id_func)
    return _map_row(_first_or_none(rows))


def get_by_email(email: str):
    rows = funcionarios_dao.select_funcionario_by_email(email)
    return _map_row(_first_or_none(rows))


def create(data: dict):
    rows = funcionarios_dao.insert_funcionario(
        data["nome"],
        data["tipo_func"],
        data["sexo"],
        data.get("email"),
        data.get("telefone"),
        data.get("biografia"),
        data.get("foto_url"),
    )
    return _map_row(_first_or_none(rows))


def update(id_func: int, data: dict):
    rows = funcionarios_dao.update_funcionario(
        id_func,
        data.get("nome"),
        data.get("tipo_func"),
        data.get("sexo"),
        data.get("email"),
        data.get("telefone"),
        data.get("biografia"),
        data.get("foto_url"),
    )
    return _map_row(_first_or_none(rows))


def delete(id_func: int):
    rows = funcionarios_dao.delete_funcionario(id_func)
    row = _first_or_none(rows)
    return row["idfunc"] if row else None