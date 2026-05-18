from backend.dao import internamento_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_internamento": row["codinternamento"],
        "cod_ep_urgenc": row["codepurgenc"],
        "id_func": row["idfunc"],
        "data_hora_int": row["datahoraint"],
        "data_hora_consulta": row["datahoraconsulta"],
        "data_hora_alta": row["datahoraalta"],
        "motivo_int": row["motivoint"],
        "numero_cama": row["numerocama"],
        "servico": row["servico"],
        "prioridade_internamento": row["prioridadeinternamento"],
        "estado_atual": row["estadoatual"],
        "observacoes_alta": row["observacoesalta"],
        "diagnostico_alta": row["diagnosticoalta"],
        "tipo_alta": row["tipoalta"],
    }


def get_all():
    rows = internamento_dao.select_all_internamentos()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_internamento: int):
    return _map_row(_first_or_none(internamento_dao.select_internamento_by_id(cod_internamento)))


def get_by_ep(cod_ep_urgenc: int):
    return _map_row(_first_or_none(internamento_dao.select_internamento_by_ep(cod_ep_urgenc)))


def get_by_funcionario(id_func: int):
    rows = internamento_dao.select_internamentos_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def get_by_estado(estado_atual: str):
    rows = internamento_dao.select_internamentos_by_estado(estado_atual)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = internamento_dao.insert_internamento(
        data["cod_ep_urgenc"],
        data.get("id_func"),
        data["data_hora_int"],
        data.get("data_hora_consulta"),
        data.get("data_hora_alta"),
        data["motivo_int"],
        data.get("numero_cama"),
        data.get("servico"),
        data.get("prioridade_internamento"),
        data.get("estado_atual", "ativo"),
        data.get("observacoes_alta"),
        data.get("diagnostico_alta"),
        data.get("tipo_alta"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_internamento: int, data: dict):
    rows = internamento_dao.update_internamento(cod_internamento, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_internamento: int):
    rows = internamento_dao.delete_internamento(cod_internamento)
    row = _first_or_none(rows)
    return row["codinternamento"] if row else None