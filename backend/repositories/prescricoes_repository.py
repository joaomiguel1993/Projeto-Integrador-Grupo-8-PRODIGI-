from backend.dao import prescricoes_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_prescricao": row[0],
        "id_ato": row[1],
        "cod_medicamento": row[2],
        "dosagem": row[3],
        "observacoes": row[4],
        "data_hora_presc": row[5],
        "estado_prescricao": row[6],
        "score_risco_ia": row[7],
        "validado_por_ia": row[8],
        "data_hora_validacao_ia": row[9],
    }


def listar_prescricoes():
    rows = prescricoes_dao.select_all_prescricoes()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_prescricao_por_id(id_prescricao: int):
    rows = prescricoes_dao.select_prescricao_by_id(id_prescricao)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_prescricoes_por_ato(id_ato: int):
    rows = prescricoes_dao.select_prescricoes_by_ato(id_ato)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_prescricao(data: dict):
    rows = prescricoes_dao.insert_prescricao(
        data["id_ato"],
        data["cod_medicamento"],
        data["dosagem"],
        data.get("observacoes"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_prescricao(id_prescricao: int, data: dict):
    rows = prescricoes_dao.update_prescricao(
        id_prescricao,
        data.get("id_ato"),
        data.get("cod_medicamento"),
        data.get("dosagem"),
        data.get("observacoes"),
        data.get("estado_prescricao"),
        data.get("score_risco_ia"),
        data.get("validado_por_ia"),
        data.get("data_hora_validacao_ia"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_estado_ia_prescricao(
    id_prescricao: int,
    estado_prescricao: str,
    score_risco_ia: float,
    validado_por_ia: bool,
    data_hora_validacao_ia,
):
    rows = prescricoes_dao.update_prescricao_ia_status(
        id_prescricao,
        estado_prescricao,
        score_risco_ia,
        validado_por_ia,
        data_hora_validacao_ia,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_prescricao(id_prescricao: int):
    rows = prescricoes_dao.delete_prescricao(id_prescricao)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row[0]