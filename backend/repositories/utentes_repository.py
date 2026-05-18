from backend.dao import utentes_dao


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "nif": row["nif"],
        "nome": row["nome"],
        "data_nasc": row["data_nasc"],
        "sexo": row["sexo"],
        "localidade": row["localidade"],
        "telefone": row["telefone"],
        "email": row["email"],
    }


def get_all():
    rows = utentes_dao.select_all_utente()
    return [_map_row(row) for row in rows] if rows else []


def get_by_nif(nif: str):
    rows = utentes_dao.select_utente_by_nif(nif)
    return _map_row(_first_or_none(rows))


def get_by_email(email: str):
    rows = utentes_dao.select_utente_by_email(email)
    return _map_row(_first_or_none(rows))


def create(data: dict):
    rows = utentes_dao.insert_utente(
        data["nif"],
        data["nome"],
        data["data_nasc"],
        data["sexo"],
        data.get("localidade"),
        data.get("telefone"),
        data.get("email"),
    )
    return _map_row(_first_or_none(rows))


def update(nif: str, data: dict):
    rows = utentes_dao.update_utente(
        nif,
        data.get("nome"),
        data.get("data_nasc"),
        data.get("sexo"),
        data.get("localidade"),
        data.get("telefone"),
        data.get("email"),
    )
    return _map_row(_first_or_none(rows))


def delete(nif: str):
    rows = utentes_dao.delete_utente(nif)
    row = _first_or_none(rows)
    return row["nif"] if row else None