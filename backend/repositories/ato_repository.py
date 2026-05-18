from backend.dao import ato_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_ato": row["idato"],
        "cod_ep_urgenc": row["codepurgenc"],
        "tipo": row["tipo"],
        "descricao": row["descricao"],
        "data_hora_inicio": row["datahorainicio"],
        "data_hora_fim": row["datahorafim"],
    }


def get_all():
    rows = ato_dao.select_all_atos()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_ato: int):
    return _map_row(_first_or_none(ato_dao.select_ato_by_id(id_ato)))


def get_by_cod_ep_urgenc(cod_ep_urgenc: int):
    rows = ato_dao.select_atos_by_cod_ep_urgenc(cod_ep_urgenc)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = ato_dao.insert_ato(
        data["cod_ep_urgenc"],
        data["tipo"],
        data.get("descricao"),
        data.get("data_hora_inicio"),
        data.get("data_hora_fim"),
    )
    return _map_row(_first_or_none(rows))


def update(id_ato: int, data: dict):
    rows = ato_dao.update_ato(id_ato, **data)
    return _map_row(_first_or_none(rows))


def delete(id_ato: int):
    rows = ato_dao.delete_ato(id_ato)
    row = _first_or_none(rows)
    return row["idato"] if row else None