from backend.dao import utentes_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "num_utent": row["num_utent"],
        "nome": row["nome"],
        "nif": row["nif"],
        "data_nasc": row["data_nasc"],
        "sexo": row["sexo"],
        "localidade": row["localidade"],
        "telefone": row["telefone"],
        "email": row["email"],
    }


def listar_utentes():
    rows = utentes_dao.select_all_utentes()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_utente_por_id(num_utent: int):
    rows = utentes_dao.select_utente_by_id(num_utent)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_utente_por_nif(nif: str):
    rows = utentes_dao.select_utente_by_nif(nif)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_utente(data: dict):
    rows = utentes_dao.insert_utente(
        data["nome"],
        data["nif"],
        data["data_nasc"],
        data["sexo"],
        data.get("localidade"),
        data.get("telefone"),
        data.get("email"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_utente(num_utent: int, data: dict):
    rows = utentes_dao.update_utente(
        num_utent,
        data.get("nome"),
        data.get("nif"),
        data.get("data_nasc"),
        data.get("sexo"),
        data.get("localidade"),
        data.get("telefone"),
        data.get("email"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_utente(num_utent: int):
    rows = utentes_dao.delete_utente(num_utent)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["num_utent"]