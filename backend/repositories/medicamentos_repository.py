from backend.dao import medicamentos_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_medicamento": row["codmedicamento"],
        "nome": row["nome"],
        "principio_ativo": row["principioativo"],
        "classe_terapeutica": row["classterapeutica"],
    }


def get_all():
    rows = medicamentos_dao.select_all_medicamentos()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_medicamento: int):
    rows = medicamentos_dao.select_medicamento_by_id(cod_medicamento)
    return _map_row(_first_or_none(rows))


def get_by_classe(classe_terapeutica: str):
    rows = medicamentos_dao.select_medicamentos_by_classe(classe_terapeutica)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = medicamentos_dao.insert_medicamento(
        data["nome"],
        data["principio_ativo"],
        data["classe_terapeutica"],
    )
    return _map_row(_first_or_none(rows))


def update(cod_medicamento: int, data: dict):
    rows = medicamentos_dao.update_medicamento(
        cod_medicamento,
        data.get("nome"),
        data.get("principio_ativo"),
        data.get("classe_terapeutica"),
    )
    return _map_row(_first_or_none(rows))


def delete(cod_medicamento: int):
    rows = medicamentos_dao.delete_medicamento(cod_medicamento)
    row = _first_or_none(rows)
    return row["codmedicamento"] if row else None