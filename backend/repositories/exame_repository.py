from backend.dao import exame_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_exame": row["codexame"],
        "cod_ep_urgenc": row["codepurgenc"],
        "tipo": row["tipo"],
        "resultado": row["resultado"],
        "data_hora_pedido": row["datahorapedido"],
        "data_hora_resultado": row["datahoraresultado"],
        "estado": row["estado"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = exame_dao.select_all_exames()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_exame: int):
    return _map_row(_first_or_none(exame_dao.select_exame_by_id(cod_exame)))


def get_by_ep(cod_ep_urgenc: int):
    rows = exame_dao.select_exames_by_ep(cod_ep_urgenc)
    return [_map_row(row) for row in rows] if rows else []


def get_by_estado(estado: str):
    rows = exame_dao.select_exames_by_estado(estado)
    return [_map_row(row) for row in rows] if rows else []


def get_by_tipo(tipo: str):
    rows = exame_dao.select_exames_by_tipo(tipo)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = exame_dao.select_exames_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = exame_dao.insert_exame(
        data["cod_ep_urgenc"],
        data["tipo"],
        data.get("resultado"),
        data.get("data_hora_pedido"),
        data.get("data_hora_resultado"),
        data.get("estado", "pendente"),
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_exame: int, data: dict):
    rows = exame_dao.update_exame(cod_exame, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_exame: int):
    rows = exame_dao.delete_exame(cod_exame)
    row = _first_or_none(rows)
    return row["codexame"] if row else None