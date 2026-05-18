from backend.dao import realiza_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_ato": row["idato"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = realiza_dao.select_all_realiza()
    return [_map_row(row) for row in rows] if rows else []


def get_by_ids(id_ato: int, id_func: int):
    return _map_row(_first_or_none(realiza_dao.select_realiza_by_ids(id_ato, id_func)))


def get_by_ato(id_ato: int):
    rows = realiza_dao.select_realiza_by_ato(id_ato)
    return [_map_row(row) for row in rows] if rows else []


def get_by_func(id_func: int):
    rows = realiza_dao.select_realiza_by_func(id_func)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = realiza_dao.insert_realiza(
        data["id_ato"],
        data["id_func"],
    )
    return _map_row(_first_or_none(rows))


def update(id_ato: int, id_func: int, data: dict):
    rows = realiza_dao.update_realiza(
        id_ato,
        id_func,
        data.get("id_ato"),
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def delete(id_ato: int, id_func: int):
    rows = realiza_dao.delete_realiza(id_ato, id_func)
    row = _first_or_none(rows)
    return _map_row(row)