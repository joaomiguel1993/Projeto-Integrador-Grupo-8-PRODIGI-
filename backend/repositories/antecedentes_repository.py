from backend.dao import antecedentes_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_antecedente": row["codantecedente"],
        "nome": row["nome"],
        "tipo": row["tipo"],
    }


def get_all():
    rows = antecedentes_dao.select_all_antecedentes()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_antecedente: int):
    rows = antecedentes_dao.select_antecedente_by_id(cod_antecedente)
    return _map_row(_first_or_none(rows))


def get_by_tipo(tipo: str):
    rows = antecedentes_dao.select_antecedente_by_tipo(tipo)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = antecedentes_dao.insert_antecedente(
        data["nome"],
        data.get("tipo"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_antecedente: int, data: dict):
    rows = antecedentes_dao.update_antecedente(
        cod_antecedente,
        data.get("nome"),
        data.get("tipo"),
    )
    return _map_row(_first_or_none(rows))


def delete(cod_antecedente: int):
    rows = antecedentes_dao.delete_antecedente(cod_antecedente)
    row = _first_or_none(rows)
    return row["codantecedente"] if row else None