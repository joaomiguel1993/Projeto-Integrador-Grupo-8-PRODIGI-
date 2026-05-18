from backend.dao import medicacao_ativa_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_medicacao_ativa": row["codmedicacaoativa"],
        "nif": row["nif"],
        "cod_medicamento": row["codmedicamento"],
        "data_inicio": row["datainicio"],
        "data_fim": row["datafim"],
        "dosagem": row["dosagem"],
    }


def get_all():
    rows = medicacao_ativa_dao.select_all_medicacao_ativa()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_medicacao_ativa: int):
    return _map_row(_first_or_none(medicacao_ativa_dao.select_medicacao_ativa_by_id(cod_medicacao_ativa)))


def get_by_nif(nif: str):
    rows = medicacao_ativa_dao.select_medicacao_ativa_by_nif(nif)
    return [_map_row(row) for row in rows] if rows else []


def get_by_medicamento(cod_medicamento: int):
    rows = medicacao_ativa_dao.select_medicacao_ativa_by_medicamento(cod_medicamento)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = medicacao_ativa_dao.insert_medicacao_ativa(
        data["nif"],
        data["cod_medicamento"],
        data["data_inicio"],
        data.get("data_fim"),
        data.get("dosagem"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_medicacao_ativa: int, data: dict):
    rows = medicacao_ativa_dao.update_medicacao_ativa(cod_medicacao_ativa, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_medicacao_ativa: int):
    rows = medicacao_ativa_dao.delete_medicacao_ativa(cod_medicacao_ativa)
    row = _first_or_none(rows)
    return row["codmedicacaoativa"] if row else None