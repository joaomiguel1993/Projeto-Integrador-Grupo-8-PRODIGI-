from backend.dao import utenteantecedente_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None
    return {
        "num_utent":       row["num_utent"],
        "cod_antecedente": row["cod_antecedente"],
        "data_registo":    row.get("dataregisto"),
        "nome":            row.get("nome"),
        "tipo":            row.get("tipo"),
    }


def listar_utente_antecedentes():
    rows = utenteantecedente_dao.select_all_utente_antecedentes()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_utente_antecedente(num_utent: int, cod_antecedente: int):
    rows = utenteantecedente_dao.select_utente_antecedente_by_ids(num_utent, cod_antecedente)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_antecedentes_por_utente(num_utent: int):
    rows = utenteantecedente_dao.select_antecedentes_by_utente(num_utent)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def listar_utentes_por_antecedente(cod_antecedente: int):
    rows = utenteantecedente_dao.select_utentes_by_antecedente(cod_antecedente)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_utente_antecedente(data: dict):
    rows = utenteantecedente_dao.insert_utente_antecedente(
        data["num_utent"],
        data["cod_antecedente"],
        data.get("data_registo"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_utente_antecedente(num_utent: int, cod_antecedente: int, data: dict):
    rows = utenteantecedente_dao.update_utente_antecedente(
        num_utent,
        cod_antecedente,
        data.get("data_registo"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_utente_antecedente(num_utent: int, cod_antecedente: int):
    rows = utenteantecedente_dao.delete_utente_antecedente(num_utent, cod_antecedente)
    row = _first_or_none(rows)

    if row is None:
        return None

    return {
        "num_utent": row["num_utent"],
        "cod_antecedente": row["cod_antecedente"],
        "data_registo": row["data_registo"],
    }