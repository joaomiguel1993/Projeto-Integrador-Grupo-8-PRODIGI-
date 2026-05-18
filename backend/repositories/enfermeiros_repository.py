from backend.dao import enfermeiros_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["idfunc"],
    }


def get_all():
    rows = enfermeiros_dao.select_all_enfermeiros()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_func: int):
    rows = enfermeiros_dao.select_enfermeiro_by_id(id_func)
    return _map_row(_first_or_none(rows))


def create(data: dict):
    rows = enfermeiros_dao.insert_enfermeiro(data["id_func"])
    return _map_row(_first_or_none(rows))


def delete(id_func: int):
    rows = enfermeiros_dao.delete_enfermeiro(id_func)
    row = _first_or_none(rows)
    return row["idfunc"] if row else None