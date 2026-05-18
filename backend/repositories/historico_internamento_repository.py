from backend.dao import historico_internamento_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_historico": row["idhistorico"],
        "cod_internamento": row["codinternamento"],
        "data_hora": row["datahora"],
        "tipo_evento": row["tipoevento"],
        "descricao": row["descricao"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = historico_internamento_dao.select_all_historico_internamento()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_historico: int):
    return _map_row(_first_or_none(
        historico_internamento_dao.select_historico_internamento_by_id(id_historico)
    ))


def get_by_internamento(cod_internamento: int):
    rows = historico_internamento_dao.select_historico_by_internamento(cod_internamento)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = historico_internamento_dao.select_historico_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def get_by_tipo_evento(tipo_evento: str):
    rows = historico_internamento_dao.select_historico_by_tipo_evento(tipo_evento)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = historico_internamento_dao.insert_historico_internamento(
        data["cod_internamento"],
        data.get("data_hora"),
        data["tipo_evento"],
        data["descricao"],
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def update(id_historico: int, data: dict):
    rows = historico_internamento_dao.update_historico_internamento(id_historico, **data)
    return _map_row(_first_or_none(rows))


def delete(id_historico: int):
    rows = historico_internamento_dao.delete_historico_internamento(id_historico)
    row = _first_or_none(rows)
    return row["idhistorico"] if row else None