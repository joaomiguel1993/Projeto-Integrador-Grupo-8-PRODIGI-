from backend.dao import trabalha_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["idfunc"],
        "id_hosp": row["idhosp"],
        "ativo": row["ativo"],
    }


def get_all():
    rows = trabalha_dao.select_all_trabalhos()
    return [_map_row(row) for row in rows] if rows else []


def get_by_ids(id_func: int, id_hosp: int):
    rows = trabalha_dao.select_trabalho_by_ids(id_func, id_hosp)
    return _map_row(_first_or_none(rows))


def get_by_funcionario(id_func: int):
    rows = trabalha_dao.select_trabalhos_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def get_by_hospital(id_hosp: int):
    rows = trabalha_dao.select_trabalhos_by_hospital(id_hosp)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = trabalha_dao.insert_trabalho(
        data["id_func"],
        data["id_hosp"],
        data.get("ativo", True),
    )
    return _map_row(_first_or_none(rows))


def update(id_func: int, id_hosp: int, data: dict):
    rows = trabalha_dao.update_trabalho(id_func, id_hosp, data.get("ativo"))
    return _map_row(_first_or_none(rows))


def delete(id_func: int, id_hosp: int):
    rows = trabalha_dao.delete_trabalho(id_func, id_hosp)
    row = _first_or_none(rows)
    if not row:
        return None
    return {"id_func": row["idfunc"], "id_hosp": row["idhosp"]}