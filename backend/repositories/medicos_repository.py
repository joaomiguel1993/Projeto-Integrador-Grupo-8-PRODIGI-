from backend.dao import medicos_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row["idfunc"],
        "estagiario": row["estagiario"],
        "especialidade": row["especialidade"],
    }


def get_all():
    rows = medicos_dao.select_all_medicos()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_func: int):
    rows = medicos_dao.select_medico_by_id(id_func)
    return _map_row(_first_or_none(rows))


def get_by_especialidade(especialidade: str):
    rows = medicos_dao.select_medicos_by_especialidade(especialidade)
    return [_map_row(row) for row in rows] if rows else []


def get_estagiarios(estagiario: bool = True):
    rows = medicos_dao.select_medicos_estagiarios(estagiario)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = medicos_dao.insert_medico(
        data["id_func"],
        data.get("estagiario", False),
        data["especialidade"],
    )
    return _map_row(_first_or_none(rows))


def update(id_func: int, data: dict):
    rows = medicos_dao.update_medico(
        id_func,
        data.get("estagiario"),
        data.get("especialidade"),
    )
    return _map_row(_first_or_none(rows))


def delete(id_func: int):
    rows = medicos_dao.delete_medico(id_func)
    row = _first_or_none(rows)
    return row["idfunc"] if row else None