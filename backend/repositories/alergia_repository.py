from backend.dao import alergia_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_alergia": row["codalergia"],
        "nif": row["nif"],
        "substancia": row["substancia"],
        "classe_terapeutica": row["classeterapeutica"],
        "nivel_gravidade": row["nivelgravidade"],
        "reacao": row["reacao"],
        "data_registo": row["dataregisto"],
    }


def get_all():
    rows = alergia_dao.select_all_alergias()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_alergia: int):
    return _map_row(_first_or_none(alergia_dao.select_alergia_by_id(cod_alergia)))


def get_by_nif(nif: str):
    rows = alergia_dao.select_alergias_by_nif(nif)
    return [_map_row(row) for row in rows] if rows else []


def get_by_classe(classe_terapeutica: str):
    rows = alergia_dao.select_alergias_by_classe(classe_terapeutica)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = alergia_dao.insert_alergia(
        data["nif"],
        data["substancia"],
        data["classe_terapeutica"],
        data.get("nivel_gravidade"),
        data.get("reacao"),
        data.get("data_registo"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_alergia: int, data: dict):
    rows = alergia_dao.update_alergia(cod_alergia, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_alergia: int):
    rows = alergia_dao.delete_alergia(cod_alergia)
    row = _first_or_none(rows)
    return row["codalergia"] if row else None