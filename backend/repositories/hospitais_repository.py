from backend.dao import hospitais_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_hosp": row["idhosp"],
        "nome": row["nome"],
        "localizacao": row["localizacao"],
        "email": row["email"],
        "telefone": row["telefone"],
        "total_camas": row["totalcamas"],
    }


def get_all():
    rows = hospitais_dao.select_all_hospitais()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_hosp: int):
    rows = hospitais_dao.select_hospital_by_id(id_hosp)
    return _map_row(_first_or_none(rows))


def create(data: dict):
    rows = hospitais_dao.insert_hospital(
        data["nome"],
        data["localizacao"],
        data.get("email"),
        data.get("telefone"),
        data.get("total_camas", 100),
    )
    return _map_row(_first_or_none(rows))


def update(id_hosp: int, data: dict):
    rows = hospitais_dao.update_hospital(
        id_hosp,
        data.get("nome"),
        data.get("localizacao"),
        data.get("email"),
        data.get("telefone"),
        data.get("total_camas"),
    )
    return _map_row(_first_or_none(rows))


def delete(id_hosp: int):
    rows = hospitais_dao.delete_hospital(id_hosp)
    row = _first_or_none(rows)
    return row["idhosp"] if row else None