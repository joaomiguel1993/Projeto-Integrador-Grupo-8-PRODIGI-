from backend.dao import utente_antecedentes_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "nif": row["nif"],
        "cod_antecedente": row["codantecedente"],
        "data_registo": row["dataregisto"],
    }


def get_all():
    rows = utente_antecedentes_dao.select_all_utente_antecedentes()
    return [_map_row(row) for row in rows] if rows else []


def get_by_ids(nif: str, cod_antecedente: int):
    rows = utente_antecedentes_dao.select_utente_antecedente_by_ids(nif, cod_antecedente)
    return _map_row(_first_or_none(rows))


def get_by_nif(nif: str):
    rows = utente_antecedentes_dao.select_by_nif(nif)
    return [_map_row(row) for row in rows] if rows else []


def get_by_antecedente(cod_antecedente: int):
    rows = utente_antecedentes_dao.select_by_antecedente(cod_antecedente)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = utente_antecedentes_dao.insert_utente_antecedente(
        data["nif"],
        data["cod_antecedente"],
        data.get("data_registo"),
    )
    return _map_row(_first_or_none(rows))


def update(nif: str, cod_antecedente: int, data: dict):
    rows = utente_antecedentes_dao.update_utente_antecedente(
        nif,
        cod_antecedente,
        data.get("data_registo"),
    )
    return _map_row(_first_or_none(rows))


def delete(nif: str, cod_antecedente: int):
    rows = utente_antecedentes_dao.delete_utente_antecedente(nif, cod_antecedente)
    row = _first_or_none(rows)
    if not row:
        return None
    return {"nif": row["nif"], "cod_antecedente": row["codantecedente"]}