from backend.dao import internamentos_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_internamento": row[0],
        "cod_ep_urgenc": row[1],
        "id_func": row[2],
        "data_hora_int": row[3],
        "data_hora_consulta": row[4],
        "data_hora_alta": row[5],
        "motivo_int": row[6],
        "numero_cama": row[7],
        "servico": row[8],
        "tipo_alta": row[9],
    }


def listar_internamentos():
    rows = internamentos_dao.select_all_internamentos()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_internamento_por_id(cod_internamento: int):
    rows = internamentos_dao.select_internamento_by_id(cod_internamento)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_internamento_por_episodio(cod_ep_urgenc: int):
    rows = internamentos_dao.select_internamento_by_episodio(cod_ep_urgenc)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_internamento(data: dict):
    cod_ep_urgenc = data["cod_ep_urgenc"]
    data_hora_int = data["data_hora_int"]
    motivo_int = data["motivo_int"]

    id_func = data.get("id_func")
    data_hora_consulta = data.get("data_hora_consulta")
    data_hora_alta = data.get("data_hora_alta")
    numero_cama = data.get("numero_cama")
    servico = data.get("servico")
    tipo_alta = data.get("tipo_alta")

    rows = internamentos_dao.insert_internamento(
        cod_ep_urgenc,
        data_hora_int,
        motivo_int,
        id_func,
        data_hora_consulta,
        data_hora_alta,
        numero_cama,
        servico,
        tipo_alta,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_internamento(cod_internamento: int, data: dict):
    rows = internamentos_dao.update_internamento(
        cod_internamento,
        data.get("id_func"),
        data.get("data_hora_consulta"),
        data.get("data_hora_alta"),
        data.get("motivo_int"),
        data.get("numero_cama"),
        data.get("servico"),
        data.get("tipo_alta"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_internamento(cod_internamento: int):
    rows = internamentos_dao.delete_internamento(cod_internamento)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row[0]