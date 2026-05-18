from backend.dao import prescreve_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_prescricao": row["idprescricao"],
        "id_ato": row["idato"],
        "cod_medicamento": row["codmedicamento"],
        "dosagem": row["dosagem"],
        "frequencia": row["frequencia"],
        "via_administracao": row["viaadministracao"],
        "duracao_dias": row["duracaodias"],
        "observacoes": row["observacoes"],
        "data_hora_presc": row["datahorapresc"],
        "estado_prescricao": row["estadoprescricao"],
        "score_risco_ia": row["scoreriscoia"],
        "validado_por_ia": row["validadoporia"],
        "data_hora_validacao_ia": row["datahoravalidacaoia"],
    }


def get_all():
    rows = prescreve_dao.select_all_prescricoes()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_prescricao: int):
    return _map_row(_first_or_none(prescreve_dao.select_prescricao_by_id(id_prescricao)))


def get_by_ato(id_ato: int):
    rows = prescreve_dao.select_prescricoes_by_ato(id_ato)
    return [_map_row(row) for row in rows] if rows else []


def get_by_medicamento(cod_medicamento: int):
    rows = prescreve_dao.select_prescricoes_by_medicamento(cod_medicamento)
    return [_map_row(row) for row in rows] if rows else []


def get_by_estado(estado_prescricao: str):
    rows = prescreve_dao.select_prescricoes_by_estado(estado_prescricao)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = prescreve_dao.insert_prescricao(
        data["id_ato"],
        data["cod_medicamento"],
        data["dosagem"],
        data.get("frequencia"),
        data.get("via_administracao"),
        data.get("duracao_dias"),
        data.get("observacoes"),
        data.get("data_hora_presc"),
        data.get("estado_prescricao", "pendente"),
        data.get("score_risco_ia"),
        data.get("validado_por_ia", False),
        data.get("data_hora_validacao_ia"),
    )
    return _map_row(_first_or_none(rows))


def update(id_prescricao: int, data: dict):
    rows = prescreve_dao.update_prescricao(id_prescricao, **data)
    return _map_row(_first_or_none(rows))


def delete(id_prescricao: int):
    rows = prescreve_dao.delete_prescricao(id_prescricao)
    row = _first_or_none(rows)
    return row["idprescricao"] if row else None